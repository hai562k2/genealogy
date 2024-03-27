import { ApiProperty } from '@nestjs/swagger';
import { ValidationDecorator } from 'src/utils/decorators/validation.decorator';

export class UpdateEventDto {
  @ApiProperty({ example: 'Content' })
  @ValidationDecorator([{ rule: 'optional' }])
  content: string;

  @ApiProperty({ type: [] })
  @ValidationDecorator([{ rule: 'optional' }])
  image?: string;

  @ApiProperty({ example: '01/10/2024' })
  @ValidationDecorator([{ rule: 'optional' }])
  time: string;
}
