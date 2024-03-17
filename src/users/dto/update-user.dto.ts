import { ApiProperty } from '@nestjs/swagger';
import { ValidationDecorator } from 'src/utils/decorators/validation.decorator';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';

export class UpdateUserDto {
  @ApiProperty({ example: 'John' })
  @ValidationDecorator([{ rule: 'required', params: { validationOptions: { message: ErrorCodeEnum.NAME_REQUIRED } } }])
  name: string | null;

  @ApiProperty({ type: [] })
  @ValidationDecorator([{ rule: 'optional' }])
  file?: string;

  @ApiProperty({ example: 'describe' })
  @ValidationDecorator([{ rule: 'optional' }])
  describe?: string;
}
