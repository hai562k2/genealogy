import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import ms from 'ms';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import bcrypt from 'bcryptjs';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { RoleEnum } from 'src/roles/roles.enum';
import { StatusEnum } from 'src/statuses/statuses.enum';
import crypto from 'crypto';
import { plainToClass } from 'class-transformer';
import { Status } from 'src/statuses/entities/status.entity';
import { Role } from 'src/roles/entities/role.entity';
import { AuthProvidersEnum } from './auth-providers.enum';
import { SocialInterface } from 'src/social/interfaces/social.interface';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { UsersService } from 'src/users/users.service';
import { ForgotService } from 'src/forgot/forgot.service';
import { MailService } from 'src/mail/mail.service';
import { NullableType } from '../utils/types/nullable.type';
import { LoginResponseType } from './types/login-response.type';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { SessionService } from 'src/session/session.service';
import { JwtRefreshPayloadType } from './strategies/types/jwt-refresh-payload.type';
import { Session } from 'src/session/entities/session.entity';
import { JwtPayloadType } from './strategies/types/jwt-payload.type';
import { ResponseHelper } from 'src/utils/helpers/response.helper';
import { ApiException } from 'src/utils/exceptions/api.exception';
import { BaseResponseDto } from 'src/utils/dto/base-response.dto';
import { EmailExistsDto } from './dto/email-exists.dto';
import { EmailExistsResponseType } from './types/email-exists-response.type';
import { authenticator } from 'otplib';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';
import { toFullName } from 'src/utils';
import { AUTH_COOKIE } from '../utils/auth.constant';
import { Response as ResponseType } from 'express';
import { AppConstant } from 'src/utils/app.constant';

type TCookieData = {
  res: ResponseType;
  token: string;
  refreshToken?: string;
  tokenExpiredAt?: Date;
  refreshExpiredDate?: Date;
};

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private forgotService: ForgotService,
    private sessionService: SessionService,
    private mailService: MailService,
    private configService: ConfigService<AllConfigType>,
  ) {}

  async checkEmailExists(
    emailExistsDto: EmailExistsDto,
    onlyAdmin: boolean,
  ): Promise<BaseResponseDto<EmailExistsResponseType>> {
    const user = await this.usersService.findOne({
      email: emailExistsDto.email,
    });

    if (!user || (user?.role && !(onlyAdmin ? [RoleEnum.admin] : [RoleEnum.user]).includes(user.role.id))) {
      throw new ApiException(
        {
          email: ErrorCodeEnum.EMAIL_NOT_EXISTS,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          email: emailExistsDto.email,
        },
      );
    }

    if (user.provider !== AuthProvidersEnum.email) {
      throw new ApiException(
        {
          email: ErrorCodeEnum.EMAIL_NOT_EXISTS,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          email: emailExistsDto.email,
        },
      );
    }

    const otpSecret = authenticator.generateSecret();
    await this.usersService.update(user.id, { otpSecret: otpSecret });

    await this.mailService.passwordOnetime({
      to: emailExistsDto.email,
      data: {
        password: this.generateOTP(otpSecret),
      },
    });

    return ResponseHelper.success(user);
  }

  async validateLogin(loginDto: AuthEmailLoginDto, onlyAdmin: boolean): Promise<LoginResponseType> {
    const user = await this.usersService.findOne({
      email: loginDto.email,
    });

    if (!user || (user?.role && !(onlyAdmin ? [RoleEnum.admin] : [RoleEnum.user]).includes(user.role.id))) {
      throw new ApiException(
        {
          email: ErrorCodeEnum.EMAIL_NOT_EXISTS,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          email: loginDto.email,
        },
      );
    }

    if (user.provider !== AuthProvidersEnum.email) {
      throw new ApiException(
        {
          email: ErrorCodeEnum.EMAIL_NOT_EXISTS,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          email: loginDto.email,
        },
      );
    }

    const verified = authenticator.check(loginDto.password, user?.otpSecret);

    if (!verified) {
      throw new ApiException(
        {
          password: ErrorCodeEnum.PASSWORD_REQUIRED,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          email: loginDto.email,
        },
      );
    }

    const session = await this.sessionService.create({
      user,
    });

    const { token, refreshToken, tokenExpires, refreshTokenExpires } = await this.getTokensData({
      id: user.id,
      role: user.role,
      sessionId: session.id,
      isRememberMe: loginDto.remember === AppConstant.LOGIN_REMEMBER,
    });

    return {
      refreshToken,
      token,
      tokenExpires,
      refreshTokenExpires,
      user,
    };
  }

  async validateSocialLogin(authProvider: string, socialData: SocialInterface): Promise<LoginResponseType> {
    let user: NullableType<User>;
    const socialEmail = socialData.email?.toLowerCase();

    const userByEmail = await this.usersService.findOne({
      email: socialEmail,
    });

    user = await this.usersService.findOne({
      socialId: socialData.id,
      provider: authProvider,
    });

    if (user) {
      if (socialEmail && !userByEmail) {
        user.email = socialEmail;
      }
      await this.usersService.update(user.id, user);
    } else if (userByEmail) {
      user = userByEmail;
    } else {
      const role = plainToClass(Role, {
        id: RoleEnum.user,
      });
      const status = plainToClass(Status, {
        id: StatusEnum.active,
      });

      user = await this.usersService.create({
        email: socialEmail ?? null,
        name: toFullName(socialData),
        socialId: socialData.id,
        provider: authProvider,
        role,
        status,
      });

      user = await this.usersService.findOne({
        id: user.id,
      });
    }

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            user: 'userNotFound',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const session = await this.sessionService.create({
      user,
    });

    const {
      token: jwtToken,
      refreshToken,
      tokenExpires,
      refreshTokenExpires,
    } = await this.getTokensData({
      id: user.id,
      role: user.role,
      sessionId: session.id,
    });

    return {
      refreshToken,
      token: jwtToken,
      tokenExpires,
      refreshTokenExpires,
      user,
    };
  }

  async register(dto: AuthRegisterLoginDto): Promise<BaseResponseDto<EmailExistsResponseType>> {
    const hash = crypto.createHash('sha256').update(randomStringGenerator()).digest('hex');
    const otpSecret = authenticator.generateSecret();

    const user = await this.usersService.create({
      ...dto,
      email: dto.email,
      role: {
        id: RoleEnum.user,
      } as Role,
      status: {
        id: StatusEnum.active,
      } as Status,
      hash,
      otpSecret,
    });

    await this.mailService.passwordOnetime({
      to: dto.email,
      data: {
        password: this.generateOTP(otpSecret),
      },
    });

    return ResponseHelper.success(user);
  }

  async confirmEmail(hash: string): Promise<void> {
    const user = await this.usersService.findOne({
      hash,
    });

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `notFound`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    user.hash = null;
    user.status = plainToClass(Status, {
      id: StatusEnum.active,
    });
    await user.save();
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findOne({
      email,
    });

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailNotExists',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const hash = crypto.createHash('sha256').update(randomStringGenerator()).digest('hex');
    await this.forgotService.create({
      hash,
      user,
    });

    await this.mailService.forgotPassword({
      to: email,
      data: {
        hash,
      },
    });
  }

  async resetPassword(hash: string, password: string): Promise<void> {
    const forgot = await this.forgotService.findOne({
      where: {
        hash,
      },
    });

    if (!forgot) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            hash: `notFound`,
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const user = forgot.user;
    user.password = password;

    await this.sessionService.softDelete({
      user: {
        id: user.id,
      },
    });
    await user.save();
    await this.forgotService.softDelete(forgot.id);
  }

  async me(userJwtPayload: JwtPayloadType): Promise<NullableType<User>> {
    return this.usersService.findOne({
      id: userJwtPayload.id,
    });
  }

  async update(userJwtPayload: JwtPayloadType, userDto: AuthUpdateDto): Promise<NullableType<User>> {
    if (userDto.password) {
      if (userDto.oldPassword) {
        const currentUser = await this.usersService.findOne({
          id: userJwtPayload.id,
        });

        if (!currentUser) {
          throw new HttpException(
            {
              status: HttpStatus.UNPROCESSABLE_ENTITY,
              errors: {
                user: 'userNotFound',
              },
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }

        const isValidOldPassword = await bcrypt.compare(userDto.oldPassword, currentUser.password);

        if (!isValidOldPassword) {
          throw new HttpException(
            {
              status: HttpStatus.UNPROCESSABLE_ENTITY,
              errors: {
                oldPassword: 'incorrectOldPassword',
              },
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        } else {
          await this.sessionService.softDelete({
            user: {
              id: currentUser.id,
            },
            excludeId: userJwtPayload.sessionId,
          });
        }
      } else {
        throw new HttpException(
          {
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: {
              oldPassword: 'missingOldPassword',
            },
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }

    await this.usersService.update(userJwtPayload.id, userDto);

    return this.usersService.findOne({
      id: userJwtPayload.id,
    });
  }

  async refreshToken(data: Pick<JwtRefreshPayloadType, 'sessionId'>): Promise<Omit<LoginResponseType, 'user'>> {
    const session = await this.sessionService.findOne({
      where: {
        id: data.sessionId,
      },
    });

    if (!session) {
      throw new UnauthorizedException();
    }

    const { token, refreshToken, tokenExpires, refreshTokenExpires } = await this.getTokensData({
      id: session.user.id,
      role: session.user.role,
      sessionId: session.id,
      isRefresh: true,
    });

    return {
      token,
      refreshToken,
      tokenExpires,
      refreshTokenExpires,
    };
  }

  async softDelete(user: User): Promise<void> {
    await this.usersService.softDelete(user.id);
  }

  async logout(data: Pick<JwtRefreshPayloadType, 'sessionId'>) {
    return this.sessionService.softDelete({
      id: data.sessionId,
    });
  }

  private async getTokensData(data: {
    id: User['id'];
    role: User['role'];
    sessionId: Session['id'];
    isRefresh?: boolean;
    isRememberMe?: boolean;
  }) {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });
    const refreshTokenExpiresIn = this.configService.getOrThrow('auth.refreshExpires', {
      infer: true,
    });
    const tokenExpires = Date.now() + ms(tokenExpiresIn);
    const refreshTokenExpires = data.isRememberMe ? Date.now() + ms(refreshTokenExpiresIn) : tokenExpires;

    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: data.id,
          role: data.role,
          sessionId: data.sessionId,
        },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      !!data.isRefresh
        ? undefined
        : await this.jwtService.signAsync(
            {
              sessionId: data.sessionId,
            },
            {
              secret: this.configService.getOrThrow('auth.refreshSecret', {
                infer: true,
              }),
              expiresIn: data.isRememberMe ? refreshTokenExpiresIn : tokenExpiresIn,
            },
          ),
    ]);

    return {
      token,
      refreshToken,
      tokenExpires,
      refreshTokenExpires,
    };
  }

  private generateOTP(secret: string) {
    authenticator.options = {
      step: this.configService.getOrThrow('app.ttl', {
        infer: true,
      }),
    };

    return authenticator.generate(secret);
  }

  setAuthCookie({ res, token, refreshToken, tokenExpiredAt, refreshExpiredDate }: TCookieData) {
    this.setCookie(res, AUTH_COOKIE.TOKEN, token, tokenExpiredAt);
    if (refreshToken) this.setCookie(res, AUTH_COOKIE.REFRESH_TOKEN, refreshToken, refreshExpiredDate);
  }

  clearAuthCookie(res: ResponseType) {
    const now = new Date();
    this.setCookie(res, AUTH_COOKIE.TOKEN, '', now);
    this.setCookie(res, AUTH_COOKIE.REFRESH_TOKEN, '', now);
  }

  private setCookie(res: ResponseType, key: string, value: string, expires?: Date) {
    res.cookie(key, value, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: expires,
    });
  }
}
