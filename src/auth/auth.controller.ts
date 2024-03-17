import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Request,
  Post,
  UseGuards,
  Patch,
  Delete,
  SerializeOptions,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
import { AuthConfirmEmailDto } from './dto/auth-confirm-email.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { LoginResponseType } from './types/login-response.type';
import { User } from '../users/entities/user.entity';
import { NullableType } from '../utils/types/nullable.type';
import { BaseResponseDto } from 'src/utils/dto/base-response.dto';
import { EmailExistsDto } from './dto/email-exists.dto';
import { EmailExistsResponseType } from './types/email-exists-response.type';
import { Response as ResponseType } from 'express';
import { ResponseHelper } from '../utils/helpers/response.helper';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @SerializeOptions({
    groups: ['me'],
  })
  @Post('email/exists')
  @HttpCode(HttpStatus.OK)
  public checkEmailExists(@Body() emailExistsDto: EmailExistsDto): Promise<BaseResponseDto<EmailExistsResponseType>> {
    return this.service.checkEmailExists(emailExistsDto, false);
  }

  @SerializeOptions({
    groups: ['me'],
  })
  @Post('email/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: AuthEmailLoginDto,
    @Res({ passthrough: true }) res: ResponseType,
  ): Promise<BaseResponseDto<User>> {
    const { token, refreshToken, user, tokenExpires, refreshTokenExpires } = await this.service.validateLogin(
      loginDto,
      false,
    );
    const isRememberMe = false;
    const tokenExpiredAt = new Date(tokenExpires);
    const refreshExpiredDate = isRememberMe ? new Date(refreshTokenExpires) : undefined;
    this.service.setAuthCookie({ res, token, refreshToken, tokenExpiredAt, refreshExpiredDate });

    return ResponseHelper.success(user);
  }

  @SerializeOptions({
    groups: ['me'],
  })
  @Post('admin/email/login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(
    @Body() loginDto: AuthEmailLoginDto,
    @Res({ passthrough: true }) res: ResponseType,
  ): Promise<BaseResponseDto<User>> {
    const { token, refreshToken, user, tokenExpires, refreshTokenExpires } = await this.service.validateLogin(
      loginDto,
      true,
    );
    const tokenExpiredAt = new Date(tokenExpires);
    const refreshExpiredDate = new Date(refreshTokenExpires);
    this.service.setAuthCookie({ res, token, refreshToken, tokenExpiredAt, refreshExpiredDate });

    return ResponseHelper.success(user);
  }

  @SerializeOptions({
    groups: ['me'],
  })
  @Post('email/register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() createUserDto: AuthRegisterLoginDto): Promise<BaseResponseDto<EmailExistsResponseType>> {
    return this.service.register(createUserDto);
  }

  @Post('email/confirm')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmEmail(@Body() confirmEmailDto: AuthConfirmEmailDto): Promise<void> {
    return this.service.confirmEmail(confirmEmailDto.hash);
  }

  @Post('forgot/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async forgotPassword(@Body() forgotPasswordDto: AuthForgotPasswordDto): Promise<void> {
    return this.service.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(@Body() resetPasswordDto: AuthResetPasswordDto): Promise<void> {
    return this.service.resetPassword(resetPasswordDto.hash, resetPasswordDto.password);
  }

  @ApiCookieAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  public me(@Request() request): Promise<NullableType<User>> {
    return this.service.me(request.user);
  }

  @ApiCookieAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  public async refresh(@Request() request): Promise<Omit<LoginResponseType, 'user'>> {
    const data = await this.service.refreshToken({
      sessionId: request.user.sessionId,
    });
    const { token, tokenExpires } = data;
    const tokenExpiredAt = new Date(tokenExpires);
    this.service.setAuthCookie({ res: request.res, token, tokenExpiredAt });
    return data;
  }

  @ApiCookieAuth()
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@Request() request, @Res({ passthrough: true }) res: ResponseType): Promise<void> {
    this.service.clearAuthCookie(res);
    await this.service.logout({
      sessionId: request.user.sessionId,
    });
  }

  @ApiCookieAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  public update(@Request() request, @Body() userDto: AuthUpdateDto): Promise<NullableType<User>> {
    return this.service.update(request.user, userDto);
  }

  @ApiCookieAuth()
  @Delete('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Request() request, @Res({ passthrough: true }) res: ResponseType): Promise<void> {
    await this.service.softDelete(request.user);
    this.service.clearAuthCookie(res);

    await this.service.logout({
      sessionId: request.user.sessionId,
    });
  }
}
