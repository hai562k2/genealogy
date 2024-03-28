import { HttpStatus, Injectable } from '@nestjs/common';
import { Pay } from './entities/pay.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonService } from 'src/utils/services/common.service';
import { CreatePayDto } from './dto/create-pay.dto';
import { BaseResponseDto } from 'src/utils/dto/base-response.dto';
import { ResponseHelper } from 'src/utils/helpers/response.helper';
import { CreatePayResponseType } from './types/create-pay-response.type';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { ApiException } from 'src/utils/exceptions/api.exception';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';
import { UpdatePayDto } from './dto/update-pay.dto';
import { FilterPayDto } from './dto/filter-pay.dto';

@Injectable()
export class PayService {
  constructor(
    @InjectRepository(Pay) private payRepository: Repository<Pay>,
    private readonly commonService: CommonService,
  ) {}

  async create(createPayDto: CreatePayDto): Promise<BaseResponseDto<CreatePayResponseType>> {
    const pay = await this.payRepository.save(this.payRepository.create(createPayDto));
    return ResponseHelper.success(pay);
  }

  async findManyWithPagination(paginationDto: FilterPayDto, userId: number) {
    const queryPay = this.payRepository.createQueryBuilder('pay');
    queryPay.leftJoinAndSelect('pay.clan', 'clan');
    queryPay.leftJoin('clan.members', 'member', 'member.user_id = :userId', {
      userId,
    });

    if (paginationDto.keyword) {
      queryPay.where('LOWER(pay.description) LIKE :keyword', {
        keyword: `%${paginationDto.keyword.toString().toLowerCase()}%`,
      });
    }

    if (paginationDto.clanId) {
      queryPay.andWhere('Clan.id = :clanId', {
        id: paginationDto.id,
      });
    }

    return this.commonService.getDataByPagination(paginationDto, queryPay);
  }

  async findOne(fields: EntityCondition<Pay>): Promise<BaseResponseDto<CreatePayResponseType>> {
    const queryPay = this.payRepository.createQueryBuilder('pay').where(fields);
    queryPay.leftJoinAndSelect('pay.clan', 'clan');

    const pay = await queryPay.getOne();

    if (!pay) {
      throw new ApiException(
        {
          id: ErrorCodeEnum.PAY_NOT_FOUND,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          id: fields.id,
        },
      );
    }

    return ResponseHelper.success(pay);
  }

  async update(id: Pay['id'], payload: UpdatePayDto): Promise<BaseResponseDto<CreatePayResponseType>> {
    const pay = await this.payRepository.save(
      this.payRepository.create({
        id,
        ...payload,
      }),
    );

    return ResponseHelper.success(pay);
  }

  async softDelete(id: Pay['id']): Promise<void> {
    await this.payRepository.softDelete(id);
  }
}
