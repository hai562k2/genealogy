import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Clan } from './entities/clan.entity';
import { DeepPartial, Repository } from 'typeorm';
import { CreateClanDto } from './dto/create-clanDto';
import { BaseResponseDto } from 'src/utils/dto/base-response.dto';
import { ResponseHelper } from 'src/utils/helpers/response.helper';
import { FilterClanDto } from './dto/filter-clan.dto';
import { CreateClanResponseType } from './types/create-clan-response.type';
import { CommonService } from 'src/utils/services/common.service';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { ApiException } from 'src/utils/exceptions/api.exception';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';
import { ListClanResponseType } from './types/list-clan-reponse.type';
import { isNotEmptyField, isOwner } from 'src/utils';
import { MemberService } from './member.service';

@Injectable()
export class ClanService {
  constructor(
    @InjectRepository(Clan)
    private clanRepository: Repository<Clan>,
    private commonService: CommonService,
    private membersService: MemberService,
  ) {}

  async create(createClanDto: CreateClanDto): Promise<BaseResponseDto<Clan>> {
    const clan = await this.clanRepository.save(this.clanRepository.create(createClanDto));
    return ResponseHelper.success(clan);
  }

  async findManyWithPagination(paginationDto: FilterClanDto): Promise<BaseResponseDto<ListClanResponseType>> {
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

    // const member = this.commonService.getAccountInformationLogin(request);
    // if (member) {
    //   queryClan.innerJoin('Organization.members', 'members');
    //   queryClan.andWhere('members.user_id = :memberId', {
    //     memberId: member.id,
    //   });
    // }

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

  async update(id: Clan['id'], payload: DeepPartial<Clan>): Promise<BaseResponseDto<CreateClanResponseType>> {
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
}
