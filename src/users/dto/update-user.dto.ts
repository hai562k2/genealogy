import { ApiProperty } from '@nestjs/swagger';
import { ValidationDecorator } from 'src/utils/decorators/validation.decorator';

export class UpdateUserDto {
  @ApiProperty({ example: 'John' })
  @ValidationDecorator([{ rule: 'optional' }])
  name?: string | null;

  @ApiProperty({ type: [] })
  @ValidationDecorator([{ rule: 'optional' }])
  image?: string;

  @ApiProperty({ example: 1 })
  @ValidationDecorator([{ rule: 'optional' }])
  gender?: string;

  @ApiProperty({ example: '2000-01-01', type: Date })
  @ValidationDecorator([{ rule: 'optional' }])
  birthday?: Date;

  @ApiProperty({ example: '2000-01-01', type: Date })
  @ValidationDecorator([{ rule: 'optional' }])
  lunarBirthday?: Date;

  @ApiProperty({ example: 'Viet Nam' })
  @ValidationDecorator([{ rule: 'optional' }])
  country?: string;

  @ApiProperty({ example: 'Khong' })
  @ValidationDecorator([{ rule: 'optional' }])
  religion?: string;

  @ApiProperty({ example: 'Dai hoc' })
  @ValidationDecorator([{ rule: 'optional' }])
  literacy?: string;

  @ApiProperty({ example: '0323456789' })
  @ValidationDecorator([{ rule: 'optional' }])
  phone?: string;

  @ApiProperty({ example: 'Driver' })
  @ValidationDecorator([{ rule: 'optional' }])
  job?: string;

  @ApiProperty({ example: 'Ha Noi' })
  @ValidationDecorator([{ rule: 'optional' }])
  work_address?: string;

  @ApiProperty({ example: 1 })
  @ValidationDecorator([{ rule: 'optional' }, { rule: 'int' }])
  fatherId?: number;

  @ApiProperty({ example: 1 })
  @ValidationDecorator([{ rule: 'optional' }, { rule: 'int' }])
  motherId?: number;

  @ApiProperty({ example: [1] })
  @ValidationDecorator([{ rule: 'optional' }, { rule: 'array' }])
  partnerId?: number[];

  @ApiProperty({ example: '0323456789' })
  @ValidationDecorator([{ rule: 'optional' }])
  description?: string;

  @ApiProperty({ example: '2022-01-01', type: Date })
  @ValidationDecorator([{ rule: 'optional' }])
  deadDay?: Date;

  @ApiProperty({ example: '2019-01-01', type: Date })
  @ValidationDecorator([{ rule: 'optional' }])
  lunarDeadDay?: Date;
}
