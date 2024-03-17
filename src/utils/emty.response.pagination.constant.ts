import { PaginationDto } from './dto/pagination.dto';
export const EMPTY_RESPONSE_PAGINATION = (paginationDto: PaginationDto) => ({
  items: [],
  page: paginationDto.page,
  limit: paginationDto.limit,
  total: 0,
});
