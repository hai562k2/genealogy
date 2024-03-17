import { ApiProperty } from '@nestjs/swagger';
import { ValidationDecorator } from '../decorators/validation.decorator';
import { PATTERN } from '../validators/pattern.constants.validator';

export class PaginationDto {
  @ApiProperty({ example: 1 })
  @ValidationDecorator([
    { rule: 'optional' },
    { rule: 'match', params: { ruleOptions: { pattern: PATTERN.PageLimit } } },
  ])
  page: number = 1;

  @ApiProperty({ example: 10 })
  @ValidationDecorator([
    { rule: 'optional' },
    { rule: 'match', params: { ruleOptions: { pattern: PATTERN.PageLimit } } },
  ])
  limit: number = 10;

  @ApiProperty({ example: '' })
  @ValidationDecorator([{ rule: 'optional' }])
  keyword: string | number;
}
