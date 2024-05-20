import { ApiProperty } from '@nestjs/swagger';
import { AppConstant } from 'src/utils/app.constant';
import { ValidationDecorator } from 'src/utils/decorators/validation.decorator';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';

export class UpdateEventDto {
  @ApiProperty({ example: 'Content' })
  @ValidationDecorator([{ rule: 'optional' }])
  content: string;

  @ApiProperty({ example: 'Title' })
  @ValidationDecorator([{ rule: 'optional' }])
  title: string;

  @ApiProperty({ type: [] })
  @ValidationDecorator([{ rule: 'optional' }])
  image?: string;

  @ApiProperty({ example: '2023/08/10', type: Date })
  @ValidationDecorator([
    { rule: 'optional' },
    {
      rule: 'isDateFormat',
      params: { entity: [AppConstant.FORMAT_DATE], validationOptions: { message: ErrorCodeEnum.TIME_EVENT_IS_DATE } },
    },
  ])
  timeEvent: Date;
}
