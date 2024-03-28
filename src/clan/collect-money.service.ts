import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCollectMoneyDto } from './dto/create-collect-money.dto';
import { BaseResponseDto } from 'src/utils/dto/base-response.dto';
import { CreateCollectMoneyResponseType } from './types/create-collect-money.type';
import { InjectRepository } from '@nestjs/typeorm';
import { CollectMoney } from './entities/collect-money.entity';
import { Repository } from 'typeorm';
import { ResponseHelper } from 'src/utils/helpers/response.helper';
import { CommonService } from 'src/utils/services/common.service';
import { FilterCollectMoneyDto } from './dto/filter-collect-money.dto';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { ApiException } from 'src/utils/exceptions/api.exception';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';
import { UpdateCollectMoneyDto } from './dto/update-collect-money.dto';

@Injectable()
export class CollectMoneyService {
  constructor(
    @InjectRepository(CollectMoney) private collectMoneyRepository: Repository<CollectMoney>,
    private readonly commonService: CommonService,
  ) {}

  async create(createCollectMoneyDto: CreateCollectMoneyDto): Promise<BaseResponseDto<CreateCollectMoneyResponseType>> {
    const collectMoney = await this.collectMoneyRepository.save(
      this.collectMoneyRepository.create(createCollectMoneyDto),
    );
    return ResponseHelper.success(collectMoney);
  }

  async findManyWithPagination(paginationDto: FilterCollectMoneyDto, userId: number) {
    const queryCollectMoney = this.collectMoneyRepository.createQueryBuilder('collectMoney');
    queryCollectMoney.leftJoinAndSelect('collectMoney.clan', 'clan');
    queryCollectMoney.leftJoinAndSelect('collectMoney.user', 'user');
    queryCollectMoney.leftJoin('clan.members', 'member', 'member.user_id = :userId', {
      userId,
    });

    if (paginationDto.keyword) {
      queryCollectMoney.where('LOWER(user.name) LIKE :keyword', {
        keyword: `%${paginationDto.keyword.toString().toLowerCase()}%`,
      });
    }

    if (paginationDto.clanId) {
      queryCollectMoney.andWhere('Clan.id = :clanId', {
        id: paginationDto.id,
      });
    }

    if (paginationDto.userId) {
      queryCollectMoney.andWhere('user.id = :userId', {
        id: paginationDto.id,
      });
    }

    if (paginationDto.description) {
      queryCollectMoney.where('LOWER(collectMoney.description) LIKE :keyword', {
        keyword: `%${paginationDto.keyword.toString().toLowerCase()}%`,
      });
    }

    return this.commonService.getDataByPagination(paginationDto, queryCollectMoney);
  }

  async findOne(fields: EntityCondition<CollectMoney>): Promise<BaseResponseDto<CreateCollectMoneyResponseType>> {
    const queryCollectMoney = this.collectMoneyRepository.createQueryBuilder('collectMoney');
    queryCollectMoney.leftJoinAndSelect('collectMoney.clan', 'clan');

    const collectMoney = await queryCollectMoney.getOne();

    if (!collectMoney) {
      throw new ApiException(
        {
          id: ErrorCodeEnum.COLLECT_MONEY_NOT_FOUND,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          id: fields.id,
        },
      );
    }

    return ResponseHelper.success(collectMoney);
  }

  async update(
    id: CollectMoney['id'],
    payload: UpdateCollectMoneyDto,
  ): Promise<BaseResponseDto<CreateCollectMoneyResponseType>> {
    const collectMoney = await this.collectMoneyRepository.save(
      this.collectMoneyRepository.create({
        id,
        ...payload,
      }),
    );

    return ResponseHelper.success(collectMoney);
  }

  async softDelete(id: CollectMoney['id']): Promise<void> {
    await this.collectMoneyRepository.softDelete(id);
  }

  async totalCollectMoney(clanId: number): Promise<BaseResponseDto<number>> {
    const collectMoneys = await this.collectMoneyRepository.find({ where: { clanId: clanId } });
    const totalMoney = collectMoneys.reduce((accumulator, currentValue) => accumulator + currentValue.money, 0);

    return ResponseHelper.success(totalMoney);
  }
}
