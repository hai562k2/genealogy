import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';
import { ValidationDecorator } from 'src/utils/decorators/validation.decorator';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';

export class AuthRegisterNoOtpDto {
  @ApiProperty({ example: 'test1@example.com' })
  @Transform(lowerCaseTransformer)
  @ValidationDecorator([
    { rule: 'required', params: { validationOptions: { message: ErrorCodeEnum.EMAIL_NOT_EXISTS } } },
    { rule: 'email', params: { validationOptions: { message: ErrorCodeEnum.IS_EMAIL } } },
    {
      rule: 'isNotExist',
      params: { entity: ['User'], validationOptions: { message: ErrorCodeEnum.EMAIL_IS_NOT_EXISTS } },
    },
  ])
  email: string;

  @ApiProperty({ example: 'John' })
  @ValidationDecorator([{ rule: 'required', params: { validationOptions: { message: ErrorCodeEnum.NAME_REQUIRED } } }])
  name: string;

  @ApiProperty({ example: 1 })
  @ValidationDecorator([{ rule: 'optional' }, { rule: 'int' }])
  fatherId?: number;

  @ApiProperty({ example: 1 })
  @ValidationDecorator([{ rule: 'optional' }, { rule: 'int' }])
  motherId?: number;

  @ApiProperty({ example: [1] })
  @ValidationDecorator([{ rule: 'optional' }, { rule: 'array' }])
  partnerId?: number[];

  @ApiProperty({ example: 1 })
  @ValidationDecorator([{ rule: 'optional' }])
  gender?: string;
}
