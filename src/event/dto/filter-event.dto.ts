import { ApiProperty } from '@nestjs/swagger';
import { ValidationDecorator } from 'src/utils/decorators/validation.decorator';
import { FilterOperationDto } from 'src/utils/dto/filter-operation.dto';
import { PaginationDto } from 'src/utils/dto/pagination.dto';

export class FilterEventDto extends PaginationDto {
  @ApiProperty({ example: '' })
  @ValidationDecorator([{ rule: 'optional' }])
  id: number;

  @ApiProperty({
    type: [FilterOperationDto],
  })
  @ValidationDecorator([{ rule: 'optional' }])
  clanId: FilterOperationDto[];

  @ApiProperty({
    type: [FilterOperationDto],
  })
  @ValidationDecorator([{ rule: 'optional' }])
  createdBy: FilterOperationDto[];

  @ApiProperty({
    type: [FilterOperationDto],
  })
  @ValidationDecorator([{ rule: 'optional' }])
  commentCount: FilterOperationDto[];
}
