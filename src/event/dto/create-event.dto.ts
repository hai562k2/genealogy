import { ApiProperty } from '@nestjs/swagger';
import { AppConstant } from 'src/utils/app.constant';
import { ValidationDecorator } from 'src/utils/decorators/validation.decorator';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';

export class CreateEventDto {
  @ApiProperty({ example: 1 })
  @ValidationDecorator([
    { rule: 'required', params: { validationOptions: { message: ErrorCodeEnum.CLAN_ID_REQUIRED } } },
    { rule: 'int', params: { validationOptions: { message: ErrorCodeEnum.CLAN_ID_IS_INT } } },
  ])
  clanId: number;

  @ApiProperty({ example: 'Content' })
  @ValidationDecorator([
    { rule: 'required', params: { validationOptions: { message: ErrorCodeEnum.CONTENT_IS_REQUIRED } } },
  ])
  content: string;

  @ApiProperty({ type: [] })
  @ValidationDecorator([{ rule: 'optional' }])
  image?: string;

  @ApiProperty({ example: '2023-08-10 15:00', type: Date })
  @ValidationDecorator([
    { rule: 'required', params: { validationOptions: { message: ErrorCodeEnum.TIME_EVENT_REQUIRED } } },
    {
      rule: 'isDateFormat',
      params: { entity: [AppConstant.FORMAT_DATE], validationOptions: { message: ErrorCodeEnum.TIME_EVENT_IS_DATE } },
    },
  ])
  timeEvent: Date;
}
