import { ApiProperty } from '@nestjs/swagger';
import { ValidationDecorator } from 'src/utils/decorators/validation.decorator';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';

export class UpdateCollectMoneyDto {
  @ApiProperty({ example: 100000 })
  @ValidationDecorator([
    { rule: 'optional' },
    { rule: 'int', params: { validationOptions: { message: ErrorCodeEnum.MONEY_IS_INT } } },
  ])
  money: number;

  @ApiProperty({ example: 'Collect money description' })
  @ValidationDecorator([{ rule: 'optional' }])
  description: string;

  @ApiProperty({ example: 'Rule of clan' })
  @ValidationDecorator([{ rule: 'optional' }])
  rule: string;
}
