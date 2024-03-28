import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventComment } from './entities/event-comment.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/utils/services/common.service';
import { CreateEventCommentDto } from './dto/create-event-comment.dto';
import { BaseResponseDto } from 'src/utils/dto/base-response.dto';
import { CreateEventCommentResponseType } from './types/create-event-comment-response.type';
import { ResponseHelper } from 'src/utils/helpers/response.helper';

@Injectable()
export class EventCommentService {
  constructor(
    @InjectRepository(EventComment)
    private eventCommentRepository: Repository<EventComment>,
    private commonService: CommonService,
  ) {}

  async create(createEventCommentDto: CreateEventCommentDto): Promise<BaseResponseDto<CreateEventCommentResponseType>> {
    const eventComment = await this.eventCommentRepository.save(
      this.eventCommentRepository.create(createEventCommentDto),
    );
    return ResponseHelper.success(eventComment);
  }

  async findByEvent(eventId: number): Promise<EventComment[]> {
    const eventComments = this.eventCommentRepository.find({ where: { eventId } });
    return eventComments;
  }
}
