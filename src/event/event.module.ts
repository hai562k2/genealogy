import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { EventCommentService } from './event-comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from './entites/event.entity';
import { EventComment } from './entites/event.comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity, EventComment])],
  providers: [EventService, EventCommentService],
  controllers: [EventController],
  exports: [EventCommentService, EventService],
})
export class EventModule {}
