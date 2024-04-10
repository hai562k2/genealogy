import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { AppConstant } from 'src/utils/app.constant';
import { ValidationDecorator } from 'src/utils/decorators/validation.decorator';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';

export class InviteMemberDto {
  @ApiProperty({ example: 1 })
  @ValidationDecorator([{ rule: 'required', params: { validationOptions: { message: ErrorCodeEnum.NAME_REQUIRED } } }])
  name: string;

  @ApiProperty({ example: 'test1@example.com' })
  @Transform(lowerCaseTransformer)
  @ValidationDecorator([
    { rule: 'required', params: { validationOptions: { message: ErrorCodeEnum.EMAIL_NOT_EXISTS } } },
    { rule: 'email', params: { validationOptions: { message: ErrorCodeEnum.IS_EMAIL } } },
  ])
  email: string;

  @ApiProperty({ example: 'male' })
  @ValidationDecorator([
    {
      rule: 'isIn',
      params: {
        value: [AppConstant.MALE, AppConstant.FEMALE, AppConstant.NON_BINARY],
        validationOptions: { message: ErrorCodeEnum.INVALID_ROLE_CD },
      },
    },
  ])
  @ValidationDecorator([
    { rule: 'required', params: { validationOptions: { message: ErrorCodeEnum.ROLE_CD_REQUIRED } } },
  ])
  gender: string;

  @ApiProperty({ example: 3 })
  @ValidationDecorator([
    {
      rule: 'isIn',
      params: {
        value: [AppConstant.MALE, AppConstant.FEMALE],
        validationOptions: { message: ErrorCodeEnum.INVALID_ROLE_CD },
      },
    },
  ])
  @ValidationDecorator([
    { rule: 'required', params: { validationOptions: { message: ErrorCodeEnum.ROLE_CD_REQUIRED } } },
  ])
  roleCd: number;
}
