import { ApiProperty } from '@nestjs/swagger';
import { ValidationDecorator } from 'src/utils/decorators/validation.decorator';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';

export class DeleteFileDto {
  @ApiProperty({ type: [] })
  @ValidationDecorator([{ rule: 'required', params: { validationOptions: { message: ErrorCodeEnum.FILE_REQUIRED } } }])
  path: string[];

  @ApiProperty({ example: '1: Document, 2: Question, 3: Feedback' })
  @ValidationDecorator([{ rule: 'required', params: { validationOptions: { message: ErrorCodeEnum.FILE_REQUIRED } } }])
  type: number;
}
