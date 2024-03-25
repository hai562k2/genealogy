import { PaginationType } from 'src/utils/types/pagination.type';
import { Clan } from '../entities/clan.entity';

export type ListClanResponseType = Readonly<PaginationType<Clan>>;
