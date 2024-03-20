import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Clan } from './entities/clan.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClanService {
  constructor(
    @InjectRepository(Clan)
    private clanRepository: Repository<Clan>,
  ) {}
}
