import { ApiProperty } from '@nestjs/swagger';
import { ValidationDecorator } from 'src/utils/decorators/validation.decorator';
import { PaginationDto } from 'src/utils/dto/pagination.dto';

export class FilterClanDto extends PaginationDto {
  @ApiProperty()
  @ValidationDecorator([{ rule: 'optional' }])
  id: number;
}
