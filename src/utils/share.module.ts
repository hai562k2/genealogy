import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommonService } from 'src/utils/services/common.service';

@Module({
  imports: [],
  providers: [JwtService, CommonService],
  exports: [JwtService, CommonService],
})
export class ShareModule {}
