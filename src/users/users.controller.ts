import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  HttpCode,
  SerializeOptions,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/roles/roles.decorator';
import { RoleEnum } from 'src/roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/roles/roles.guard';
import { User } from './entities/user.entity';
import { NullableType } from '../utils/types/nullable.type';
import { CommonService } from 'src/utils/services/common.service';
import { Request } from 'express';
import { ResponseHelper } from '../utils/helpers/response.helper';
import { FileEntity } from 'src/files/entities/file.entity';
import { getValueOrDefault, isNotEmptyField } from 'src/utils';
import { FilesService } from 'src/files/files.service';
import { FilterUserDto } from './dto/filter-user.dto';
import { BaseResponseDto } from 'src/utils/dto/base-response.dto';
import { LisUserResponseType } from './type/list-user-response.type';
import { GetUsersResponseType } from './type/get-users-response.type';

@ApiBearerAuth()
@Roles(RoleEnum.admin, RoleEnum.user)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly commonService: CommonService,
    private readonly filesService: FilesService,
  ) {}

  @SerializeOptions({
    groups: ['admin'],
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProfileDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createProfileDto);
  }

  @Get('all/:clanId')
  @HttpCode(HttpStatus.OK)
  async getAll(@Param('clanId') clanId: number): Promise<BaseResponseDto<GetUsersResponseType>> {
    const users = await this.usersService.getAllUser(+clanId);
    return ResponseHelper.success(users);
  }

  @SerializeOptions({
    groups: ['admin'],
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ApiQuery({ name: 'id', required: false, type: Number })
  @ApiQuery({ name: 'clanId', required: false, type: Number })
  @ApiQuery({ name: 'memberId', required: false, type: Number })
  async findAll(@Query() paginationDto: FilterUserDto): Promise<BaseResponseDto<LisUserResponseType>> {
    paginationDto.page = Number(paginationDto.page);
    paginationDto.limit = Number(paginationDto.limit);

    return await this.usersService.findManyWithPagination(paginationDto);
  }

  @SerializeOptions({
    groups: ['admin'],
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: number): Promise<BaseResponseDto<NullableType<User>>> {
    const user = await this.usersService.findOne({ id: id });
    return ResponseHelper.success(user);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Req() request: Request, @Param('id') accountId: number, @Body() updateProfileDto: UpdateUserDto) {
    let images: FileEntity[] = [];
    if (isNotEmptyField(updateProfileDto.image)) {
      images = await this.filesService.findAllByPath(updateProfileDto.image);
    }

    const mid = getValueOrDefault(updateProfileDto.motherId, 0);
    const fid = getValueOrDefault(updateProfileDto.fatherId, 0);

    const father = await this.usersService.findOne({ id: fid });
    const mother = await this.usersService.findOne({ id: mid });

    const fatherName = getValueOrDefault(father?.name, 'No data');
    const motherName = getValueOrDefault(mother?.name, 'No data');

    const updateUser = await this.usersService.editAccount(accountId, {
      ...updateProfileDto,
      ...{ fatherName: fatherName, motherName: motherName },
      ...{
        images: images.map((image) => image.path),
      },
    });

    return ResponseHelper.success(updateUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Req() request, @Param('id') accountId: number): Promise<void> {
    const { id } = request.user.id;
    this.commonService.isProfileOwner(id, accountId);
    return this.usersService.softDelete(accountId);
  }
}
