import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';
import { ValidationDecorator } from 'src/utils/decorators/validation.decorator';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';
import { AppConstant } from 'src/utils/app.constant';

export class AuthEmailLoginDto {
  @ApiProperty({ example: 'test1@example.com' })
  @Transform(lowerCaseTransformer)
  @ValidationDecorator([
    { rule: 'required', params: { validationOptions: { message: ErrorCodeEnum.EMAIL_NOT_EXISTS } } },
    { rule: 'email', params: { validationOptions: { message: ErrorCodeEnum.IS_EMAIL } } },
    { rule: 'isExist', params: { entity: ['User'], validationOptions: { message: ErrorCodeEnum.EMAIL_NOT_EXISTS } } },
  ])
  email: string;

  @ApiProperty()
  @ValidationDecorator([
    { rule: 'required', params: { validationOptions: { message: ErrorCodeEnum.PASSWORD_REQUIRED } } },
  ])
  password: string;

  @ApiProperty({ example: 0 })
  @ValidationDecorator([
    { rule: 'optional' },
    { rule: 'int', params: { validationOptions: { message: ErrorCodeEnum.PUBLISH_OPTION_IS_INT } } },
    {
      rule: 'isIn',
      params: {
        value: [AppConstant.LOGIN_REMEMBER, AppConstant.LOGIN_NOT_REMEMBER],
        validationOptions: { message: ErrorCodeEnum.REMEMBER_ME_IS_IN_LIST },
      },
    },
  ])
  remember: number;
}
