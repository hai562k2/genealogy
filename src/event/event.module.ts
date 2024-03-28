import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { EventCommentService } from './event-comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from './entities/event.entity';
import { EventComment } from './entities/event-comment.entity';
import { ShareModule } from 'src/utils/share.module';
import { FilesService } from 'src/files/files.service';
import { FileEntity } from 'src/files/entities/file.entity';
import { ClanModule } from 'src/clan/clan.module';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity, EventComment, FileEntity]), ShareModule, ClanModule],
  providers: [EventService, EventCommentService, FilesService],
  controllers: [EventController],
  exports: [EventCommentService, EventService, FilesService],
})
export class EventModule {}
