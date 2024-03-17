import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';
import { ValidationDecorator } from 'src/utils/decorators/validation.decorator';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';

export class EmailExistsDto {
  @ApiProperty({ example: 'test1@example.com' })
  @Transform(lowerCaseTransformer)
  @ValidationDecorator([
    { rule: 'email', params: { validationOptions: { message: ErrorCodeEnum.IS_EMAIL } } },
    {
      rule: 'isExist',
      params: { entity: ['User'], validationOptions: { message: ErrorCodeEnum.EMAIL_NOT_EXISTS } },
    },
    { rule: 'required', params: { validationOptions: { message: ErrorCodeEnum.EMAIL_NOT_EXISTS } } },
  ])
  email: string;
}
