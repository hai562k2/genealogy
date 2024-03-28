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
import { CollectMoney } from './entities/collect-money.entity';
import { Pay } from './entities/pay.entity';
import { CollectMoneyService } from './collect-money.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([Clan, Member, FileEntity, CollectMoney, Pay, User]), ShareModule],
  providers: [ClanService, MemberService, FilesService, CollectMoneyService, UsersService],
  controllers: [ClanController],
  exports: [ClanService, MemberService, FilesService, CollectMoneyService, UsersService],
})
export class ClanModule {}
