import { ApiProperty } from '@nestjs/swagger';
import { ValidationDecorator } from 'src/utils/decorators/validation.decorator';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';

export class CreateClanDto {
  @ApiProperty({ example: 'Clan 1' })
  @ValidationDecorator([
    { rule: 'required', params: { validationOptions: { message: ErrorCodeEnum.CLAN_NAME_REQUIRED } } },
  ])
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
