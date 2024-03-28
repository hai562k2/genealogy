import { ApiProperty } from '@nestjs/swagger';
import { ValidationDecorator } from 'src/utils/decorators/validation.decorator';
import { PaginationDto } from 'src/utils/dto/pagination.dto';

export class FilterEventDto extends PaginationDto {
  @ApiProperty({ example: '' })
  @ValidationDecorator([{ rule: 'optional' }])
  clanId: number;
}
