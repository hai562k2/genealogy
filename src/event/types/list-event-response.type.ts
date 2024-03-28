import { PaginationType } from 'src/utils/types/pagination.type';
import { EventEntity } from '../entities/event.entity';

export type ListEventResponseType = Readonly<PaginationType<EventEntity[]>>;
