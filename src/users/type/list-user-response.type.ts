import { PaginationType } from 'src/utils/types/pagination.type';
import { User } from '../entities/user.entity';

export type LisUserResponseType = Readonly<PaginationType<User>>;
