import { ApiProperty } from '@nestjs/swagger';
import { ValidationDecorator } from 'src/utils/decorators/validation.decorator';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';

export class CreateMemberDto {
  @ApiProperty({ example: 1 })
  @ValidationDecorator([
    { rule: 'required', params: { validationOptions: { message: ErrorCodeEnum.CLAN_ID_REQUIRED } } },
  ])
  clanId: number;

  @ApiProperty({ example: 1 })
  @ValidationDecorator([
    { rule: 'required', params: { validationOptions: { message: ErrorCodeEnum.ROLE_CD_REQUIRED } } },
  ])
  roleCd: number;

  @ApiProperty({ example: 1 })
  @ValidationDecorator([
    { rule: 'required', params: { validationOptions: { message: ErrorCodeEnum.USER_ID_REQUIRED } } },
  ])
  userId: number;
}
