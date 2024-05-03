import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Clan } from './entities/clan.entity';
import { Repository } from 'typeorm';
import { CreateClanDto } from './dto/create-clan.dto';
import { BaseResponseDto } from 'src/utils/dto/base-response.dto';
import { ResponseHelper } from 'src/utils/helpers/response.helper';
import { FilterClanDto } from './dto/filter-clan.dto';
import { CreateClanResponseType } from './types/create-clan-response.type';
import { CommonService } from 'src/utils/services/common.service';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { ApiException } from 'src/utils/exceptions/api.exception';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';
import { ListClanResponseType } from './types/list-clan-reponse.type';
import { getValueOrDefault, isAdminOrOwner, isNotEmptyField, isOwner } from 'src/utils';
import { MemberService } from './member.service';
import { UsersService } from 'src/users/users.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { InviteMemberService } from './invite-member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { StatusEnum } from 'src/statuses/statuses.enum';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { ActiveMemberDto } from './dto/active-member.dto';
import { CreateInvitationMemberType } from './types/invitation-member.type';
import { UpdateClanDto } from './dto/update-clan.dto';

@Injectable()
export class ClanService {
  constructor(
    @InjectRepository(Clan)
    private clanRepository: Repository<Clan>,
    private commonService: CommonService,
    private membersService: MemberService,
    private readonly usersService: UsersService,
    private readonly inviteMemberService: InviteMemberService,
    private readonly mailService: MailService,
    private configService: ConfigService,
  ) {}

  async create(createClanDto: CreateClanDto): Promise<BaseResponseDto<Clan>> {
    const clan = await this.clanRepository.save(this.clanRepository.create(createClanDto));
    return ResponseHelper.success(clan);
  }

  async findManyWithPagination(
    paginationDto: FilterClanDto,
    userId: number,
  ): Promise<BaseResponseDto<ListClanResponseType>> {
    const queryClan = this.clanRepository.createQueryBuilder();

    if (paginationDto.keyword) {
      queryClan.where('LOWER(Clan.name) LIKE :keyword', {
        keyword: `%${paginationDto.keyword.toString().toLowerCase()}%`,
      });
    }

    if (paginationDto.id) {
      queryClan.andWhere('Clan.id = :id', {
        id: paginationDto.id,
      });
    }

    queryClan.innerJoin('Clan.members', 'members');
    queryClan.andWhere('members.user_id = :memberId', {
      memberId: userId,
    });
    queryClan.orderBy('Clan.createdAt', 'DESC');

    return this.commonService.getDataByPagination(paginationDto, queryClan);
  }

  async findOne(fields: EntityCondition<Clan>): Promise<BaseResponseDto<CreateClanResponseType>> {
    const clan = await this.clanRepository.findOne({
      where: fields,
    });

    if (!clan) {
      throw new ApiException(
        {
          id: ErrorCodeEnum.ClAN_NOT_FOUND,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          id: fields.id,
        },
      );
    }

    return ResponseHelper.success(clan);
  }

  async update(id: Clan['id'], payload: UpdateClanDto): Promise<BaseResponseDto<CreateClanResponseType>> {
    const clan = await this.clanRepository.save(
      this.clanRepository.create({
        id,
        ...payload,
      }),
    );

    return ResponseHelper.success(clan);
  }

  async softDelete(id: Clan['id']): Promise<void> {
    await this.clanRepository.softDelete(id);
  }

  async inviteMember(dto: InviteMemberDto, clanId: number): Promise<void> {
    let user = await this.usersService.checkEmailMemberExists(dto);
    if (!user) {
      user = await this.usersService.registerNotOtp(dto);
    } else {
      const emailInClan = await this.membersService.isEmailInClan(dto.email, clanId);
      const deletedMember = await this.membersService.isEmailInDeletedMembers(user.id, clanId);

      if (emailInClan) {
        throw new ApiException(
          {
            message: ErrorCodeEnum.EMAIL_IS_NOT_EXISTS,
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      } else if (deletedMember) {
        await this.membersService.delete(deletedMember.clanId, deletedMember.userId);
      }
    }

    const clan = await this.clanRepository.findOne({ where: { id: clanId } });

    if (clan?.name && user) {
      const dataInvite = {
        userId: user.id,
        clanName: clan?.name,
        clanId: clanId,
        email: dto.email,
        roleCd: dto.roleCd,
        gender: dto.gender,
        motherId: dto.motherId,
        fatherId: dto.fatherId,
        partnerId: dto.partnerId,
        name: getValueOrDefault(user.name, dto.name),
      };

      await this.inviteMemberService.create(dataInvite);
      const memberInvite = await this.inviteMemberService.findOne({ userId: dataInvite.userId });

      let createMemberDto: CreateMemberDto = {
        clanId: dataInvite.clanId,
        userId: dataInvite.userId,
        roleCd: dataInvite.roleCd,
      };

      if (user.status && user.status.id === StatusEnum.active) {
        createMemberDto = {
          ...createMemberDto,
        };
      }

      await this.membersService.create(createMemberDto);

      await this.mailService.inviteEmail({
        to: dto.email,
        data: {
          hash: `${this.configService.get('app.urlInvite', { infer: true })}/${memberInvite?.id}`,
          userName: dataInvite.name,
          organizationName: dataInvite.clanName,
        },
      });
    }
  }

  validateUserAndClanIdNotNull(userId: number, clanId: number) {
    if (!isNotEmptyField(userId, true) || !isNotEmptyField(clanId, true)) {
      throw new ApiException(
        {
          id: ErrorCodeEnum.MEMBER_NOT_PERMISSION,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  async validateMember(userId: number, clanId: number): Promise<void> {
    this.validateUserAndClanIdNotNull(userId, clanId);

    const member = await this.membersService.findOne({
      clanId: clanId,
      userId: userId,
    });

    if (!member) {
      throw new ApiException(
        {
          id: ErrorCodeEnum.MEMBER_NOT_PERMISSION,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  async validateRoleOwnerOrCreatedBy(userId: number, clanId: number, createdBy: number): Promise<boolean> {
    this.validateUserAndClanIdNotNull(userId, clanId);

    const member = await this.membersService.findOne({
      clanId: clanId,
      userId: userId,
    });

    const owner = isOwner(member?.data?.roleCd);

    if (owner || userId === createdBy) {
      return true;
    } else {
      throw new ApiException(
        {
          id: ErrorCodeEnum.MEMBER_NOT_PERMISSION,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  async validateRoleMember(userId: number, clanId: number): Promise<void> {
    this.validateUserAndClanIdNotNull(userId, clanId);

    const member = await this.membersService.findOne({
      clanId: clanId,
      userId: userId,
    });

    if (!isAdminOrOwner(member?.data?.roleCd)) {
      throw new ApiException(
        {
          id: ErrorCodeEnum.MEMBER_NOT_PERMISSION,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  async readUuidInvite(dto: ActiveMemberDto): Promise<BaseResponseDto<CreateInvitationMemberType>> {
    const uuidInvite = await this.inviteMemberService.findOne({ id: dto.token });
    if (!uuidInvite) {
      throw new ApiException(
        {
          message: ErrorCodeEnum.TOKEN_NOT_EXISTS,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    return ResponseHelper.success(uuidInvite);
  }
}
