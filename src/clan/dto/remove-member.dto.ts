import { ApiProperty } from '@nestjs/swagger';
import { ValidationDecorator } from 'src/utils/decorators/validation.decorator';

export class RemoveMemberDto {
  @ApiProperty()
  @ValidationDecorator([{ rule: 'required' }])
  id: number;

  @ApiProperty()
  @ValidationDecorator([{ rule: 'required' }])
  userId: number;
}
