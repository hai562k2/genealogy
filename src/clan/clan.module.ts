import { Module } from '@nestjs/common';
import { ClanService } from './clan.service';
import { ClanController } from './clan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clan } from './entities/clan.entity';
import { Member } from './entities/member.entity';
import { MemberService } from './member.service';

@Module({
  imports: [TypeOrmModule.forFeature([Clan, Member])],
  providers: [ClanService, MemberService],
  controllers: [ClanController],
  exports: [ClanService, MemberService],
})
export class ClanModule {}
