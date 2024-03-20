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
  @ValidationDecorator([{ rule: 'optional' }, { rule: 'int' }])
  sex?: number;

  @ApiProperty({ example: '2000-01-01', type: Date })
  @ValidationDecorator([{ rule: 'optional' }])
  birthday?: Date;

  @ApiProperty({ example: '2000-01-01', type: Date })
  @ValidationDecorator([{ rule: 'optional' }])
  lunarBirthday?: Date;

  @ApiProperty({ example: 'Viet Nam' })
  @ValidationDecorator([{ rule: 'optional' }])
  country?: string;

  @ApiProperty({ example: 1 })
  @ValidationDecorator([{ rule: 'optional' }, { rule: 'int' }])
  classify?: number;

  @ApiProperty({ example: 1 })
  @ValidationDecorator([{ rule: 'optional' }, { rule: 'int' }])
  genus?: number;

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
  father?: number;

  @ApiProperty({ example: 'July' })
  @ValidationDecorator([{ rule: 'optional' }])
  fatherName?: string;

  @ApiProperty({ example: 1 })
  @ValidationDecorator([{ rule: 'optional' }, { rule: 'int' }])
  mother?: number;

  @ApiProperty({ example: 'NaNa' })
  @ValidationDecorator([{ rule: 'optional' }])
  motherName?: string;

  @ApiProperty({ example: 1 })
  @ValidationDecorator([{ rule: 'optional' }, { rule: 'int' }])
  spouse?: number;

  @ApiProperty({ example: 'HaNa' })
  @ValidationDecorator([{ rule: 'optional' }])
  souse_name?: string;

  @ApiProperty({ example: 'Thai Nguyen' })
  @ValidationDecorator([{ rule: 'optional' }])
  domicile?: string;

  @ApiProperty({ example: 'Ha Noi' })
  @ValidationDecorator([{ rule: 'optional' }])
  resident?: string;

  @ApiProperty({ example: '0323456789' })
  @ValidationDecorator([{ rule: 'optional' }])
  description?: string;

  @ApiProperty({ example: '2022-01-01', type: Date })
  @ValidationDecorator([{ rule: 'optional' }])
  deadDay?: Date;

  @ApiProperty({ example: '2019-01-01', type: Date })
  @ValidationDecorator([{ rule: 'optional' }])
  lunarDeadDay?: Date;

  @ApiProperty({ example: 1 })
  @ValidationDecorator([{ rule: 'optional' }])
  patriarch?: number;
}
