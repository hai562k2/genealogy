import { ApiProperty } from '@nestjs/swagger';
import { ValidationDecorator } from '../decorators/validation.decorator';
import { ErrorCodeEnum } from '../error-code.enum';
import { AppConstant } from '../app.constant';

const operationValue = [AppConstant.OPERATION_IN, AppConstant.OPERATION_NOT_IN, AppConstant.OPERATION_EQ];

export class FilterOperationDto {
  @ApiProperty({
    example: `${operationValue.join(' OR ')}`,
  })
  @ValidationDecorator([
    { rule: 'optional' },
    {
      rule: 'isIn',
      params: {
        value: operationValue,
        validationOptions: { message: ErrorCodeEnum.OPERATION_INVALID },
      },
    },
  ])
  operation?: string | null;

  @ApiProperty({ type: [Number], example: [1, 2], isArray: true })
  value?: string[] | number[] = [];
}
