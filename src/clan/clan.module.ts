import { Module } from '@nestjs/common';
import { ClanService } from './clan.service';
import { ClanController } from './clan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clan } from './entities/clan.entity';
import { Member } from './entities/member.entity';
import { MemberService } from './member.service';
import { ShareModule } from 'src/utils/share.module';
import { FilesService } from 'src/files/files.service';
import { FileEntity } from 'src/files/entities/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Clan, Member, FileEntity]), ShareModule],
  providers: [ClanService, MemberService, FilesService],
  controllers: [ClanController],
  exports: [ClanService, MemberService, FilesService],
})
export class ClanModule {}
