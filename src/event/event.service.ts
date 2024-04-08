import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEntity } from './entities/event.entity';
import { Repository } from 'typeorm';
import { EventComment } from './entities/event-comment.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateEventResponseType } from './types/create-event-response.type';
import { BaseResponseDto } from 'src/utils/dto/base-response.dto';
import { ResponseHelper } from 'src/utils/helpers/response.helper';
import { FilterEventDto } from './dto/filter-event.dto';
import { CommonService } from 'src/utils/services/common.service';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { ApiException } from 'src/utils/exceptions/api.exception';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';
import { UpdateEventDto } from './dto/upate-event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(EventEntity)
    private eventRepository: Repository<EventEntity>,
    @InjectRepository(EventComment)
    private eventCommentRepository: Repository<EventComment>,
    private commonService: CommonService,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<BaseResponseDto<CreateEventResponseType>> {
    const event = await this.eventRepository.save(this.eventRepository.create(createEventDto));
    return ResponseHelper.success(event);
  }

  async findManyWithPagination(paginationDto: FilterEventDto, userId: number) {
    const queryEvent = await this.eventRepository.createQueryBuilder('Event');
    queryEvent.leftJoinAndSelect('Event.clan', 'clan');
    queryEvent.leftJoinAndSelect('Event.user', 'user');
    queryEvent.leftJoin('clan.members', 'member');
    queryEvent.andWhere('member.user_id = :userId', { userId });

    if (paginationDto.keyword) {
      queryEvent.where('LOWER(Event.content) LIKE :keyword', {
        keyword: `%${paginationDto.keyword.toString().toLowerCase()}%`,
      });
    }

    if (paginationDto.clanId) {
      queryEvent.andWhere('Clan.id = :clanId', {
        clanId: paginationDto.clanId,
      });
    }

    return this.commonService.getDataByPagination(paginationDto, queryEvent);
  }

  async findOne(fields: EntityCondition<EventEntity>): Promise<BaseResponseDto<CreateEventResponseType>> {
    const queryEvent = this.eventRepository.createQueryBuilder('event');
    queryEvent.leftJoinAndSelect('event.comments', 'comments');
    queryEvent.leftJoinAndSelect('event.clan', 'clan');

    const event = await queryEvent.getOne();

    if (!event) {
      throw new ApiException(
        {
          id: ErrorCodeEnum.EVENT_NOT_FOUND,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          id: fields.id,
        },
      );
    }

    return ResponseHelper.success(event);
  }

  async update(id: EventEntity['id'], payload: UpdateEventDto): Promise<BaseResponseDto<CreateEventResponseType>> {
    const event = await this.eventRepository.save(
      this.eventRepository.create({
        id,
        ...payload,
      }),
    );

    return ResponseHelper.success(event);
  }

  async softDelete(id: EventEntity['id']): Promise<void> {
    await this.eventRepository.softDelete(id);
  }
}
