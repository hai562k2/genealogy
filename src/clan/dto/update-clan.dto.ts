import { ApiProperty } from '@nestjs/swagger';
import { ValidationDecorator } from 'src/utils/decorators/validation.decorator';

export class UpdateClanDto {
  @ApiProperty({ example: 'Clan 1' })
  @ValidationDecorator([{ rule: 'optional' }])
  name: string;

  @ApiProperty({ example: 'Clan information' })
  @ValidationDecorator([{ rule: 'optional' }])
  information: string;

  @ApiProperty({ example: 'Rule of clan' })
  @ValidationDecorator([{ rule: 'optional' }])
  rule: string;

  @ApiProperty({ example: [] })
  @ValidationDecorator([{ rule: 'optional' }])
  image?: string;
}
