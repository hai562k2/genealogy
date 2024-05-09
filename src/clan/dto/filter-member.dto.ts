import { ApiProperty } from '@nestjs/swagger';
import { ValidationDecorator } from 'src/utils/decorators/validation.decorator';

export class FilterMemberDto {
  @ApiProperty()
  @ValidationDecorator([{ rule: 'optional' }])
  clanId: number;

  @ApiProperty()
  @ValidationDecorator([{ rule: 'optional' }])
  userId: number;
}
