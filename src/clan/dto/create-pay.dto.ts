import { ApiProperty } from '@nestjs/swagger';
import { ValidationDecorator } from 'src/utils/decorators/validation.decorator';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';

export class CreatePayDto {
  @ApiProperty({ example: 100000 })
  @ValidationDecorator([
    { rule: 'required', params: { validationOptions: { message: ErrorCodeEnum.MONEY_REQUIRED } } },
    { rule: 'int', params: { validationOptions: { message: ErrorCodeEnum.MONEY_IS_INT } } },
    { rule: 'min', params: { number: 0, validationOptions: { message: ErrorCodeEnum.FIELD_INVALID } } },
  ])
  money: number;

  @ApiProperty({ example: 'Collect money description' })
  @ValidationDecorator([{ rule: 'optional' }])
  description: string;

  @ApiProperty({ example: 1 })
  @ValidationDecorator([
    { rule: 'required', params: { validationOptions: { message: ErrorCodeEnum.CLAN_ID_REQUIRED } } },
    { rule: 'int', params: { validationOptions: { message: ErrorCodeEnum.CLAN_ID_IS_INT } } },
  ])
  clanId: number;
}
