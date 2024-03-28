import { ApiProperty } from '@nestjs/swagger';
import { ValidationDecorator } from 'src/utils/decorators/validation.decorator';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';

export class UpdatePayDto {
  @ApiProperty({ example: 100000 })
  @ValidationDecorator([
    { rule: 'optional' },
    { rule: 'int', params: { validationOptions: { message: ErrorCodeEnum.MONEY_IS_INT } } },
    { rule: 'min', params: { number: 0, validationOptions: { message: ErrorCodeEnum.FIELD_INVALID } } },
  ])
  money: number;

  @ApiProperty({ example: 'Pay description' })
  @ValidationDecorator([{ rule: 'optional' }])
  description: string;
}
