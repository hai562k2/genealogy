import {
  Controller,
  HttpStatus,
  SerializeOptions,
  UseGuards,
  Req,
  Post,
  HttpCode,
  Body,
  Get,
  Query,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiCookieAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ClanService } from './clan.service';
import { RoleEnum } from 'src/roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { CreateClanDto } from './dto/create-clan.dto';
import { BaseResponseDto } from 'src/utils/dto/base-response.dto';
import { CreateClanResponseType } from './types/create-clan-response.type';
import { FileEntity } from 'src/files/entities/file.entity';
import { isAdminOrOwner, isNotEmptyField, isOwner } from 'src/utils';
import { FilesService } from 'src/files/files.service';
import { CommonService } from 'src/utils/services/common.service';
import { Request } from 'express';
import { FilterClanDto } from './dto/filter-clan.dto';
import { ListClanResponseType } from './types/list-clan-reponse.type';
import { ChangeOwnerDto } from './dto/change-owner.dto';
import { CreateMemberResponseType } from './types/create-member-response.type';
import { MemberService } from './member.service';
import { ApiException } from 'src/utils/exceptions/api.exception';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';
import { AppConstant } from 'src/utils/app.constant';
import { CreateCollectMoneyDto } from './dto/create-collect-money.dto';
import { CreateCollectMoneyResponseType } from './types/create-collect-money.type';
import { CollectMoneyService } from './collect-money.service';
import { UsersService } from 'src/users/users.service';
import { UpdateCollectMoneyDto } from './dto/update-collect-money.dto';
import { FilterCollectMoneyDto } from './dto/filter-collect-money.dto';

@ApiTags('Clan')
@Controller({
  path: 'clan',
  version: '1',
})
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ClanController {
  constructor(
    private readonly clanService: ClanService,
    private readonly filesService: FilesService,
    private readonly commonService: CommonService,
    private readonly membersService: MemberService,
    private readonly collectMoneyService: CollectMoneyService,
    private readonly usersService: UsersService,
  ) {}

  @ApiCookieAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @SerializeOptions({
    groups: ['admin'],
  })
  @Post()
  @HttpCode(HttpStatus.OK)
  async create(
    @Body() createClanDto: CreateClanDto,
    @Req() request: Request,
  ): Promise<BaseResponseDto<CreateClanResponseType>> {
    const account = this.commonService.getAccountInformationLogin(request);
    let images: FileEntity[] = [];
    if (isNotEmptyField(createClanDto.image)) {
      images = await this.filesService.findAllByPath(createClanDto.image);
    }

    const clan = await this.clanService.create({
      ...createClanDto,
      ...{ createdBy: account.id },
      ...{
        images: images.map((image) => {
          return {
            path: image.path,
            name: image.name,
          };
        }),
      },
    });

    if (clan.data) {
      await this.membersService.create({
        ...{
          clanId: clan.data.id,
          roleCd: AppConstant.ROLE_OWNER,
        },
        ...{ userId: account.id },
      });
    }

    return clan;
  }

  @ApiCookieAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get('collect-money')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ApiQuery({ name: 'id', required: false, type: Number })
  @ApiQuery({ name: 'clanId', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'description', required: false, type: Number })
  findAllCollectMoney(
    @Query() paginationDto: FilterCollectMoneyDto,
    @Req() request: Request,
  ): Promise<BaseResponseDto<ListClanResponseType>> {
    paginationDto.page = Number(paginationDto.page);
    paginationDto.limit = Number(paginationDto.limit);
    const account = this.commonService.getAccountInformationLogin(request);

    return this.collectMoneyService.findManyWithPagination(paginationDto, account.id);
  }

  @ApiCookieAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ApiQuery({ name: 'id', required: false, type: Number })
  findAll(@Query() paginationDto: FilterClanDto): Promise<BaseResponseDto<ListClanResponseType>> {
    paginationDto.page = Number(paginationDto.page);
    paginationDto.limit = Number(paginationDto.limit);

    return this.clanService.findManyWithPagination(paginationDto);
  }

  @ApiCookieAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @SerializeOptions({
    groups: ['detail'],
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: number): Promise<BaseResponseDto<CreateClanResponseType>> {
    return await this.clanService.findOne({ id });
  }

  @ApiCookieAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @SerializeOptions({
    groups: ['admin'],
  })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: number,
    @Body() updateClanDto: CreateClanDto,
  ): Promise<BaseResponseDto<CreateClanResponseType>> {
    return await this.clanService.update(id, updateClanDto);
  }

  @ApiCookieAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @Delete(':id/members/:member_id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMembersByOrganization(
    @Param('id') id: number,
    @Param('member_id') memberId: number,
    @Req() request,
  ): Promise<void> {
    const account = this.commonService.getAccountInformationLogin(request);

    const member = await this.membersService.findOne({
      clanId: +id,
      userId: account.id,
    });

    if (!isAdminOrOwner(member?.data?.roleCd)) {
      throw new ApiException(
        {
          id: ErrorCodeEnum.MEMBER_NOT_PERMISSION,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          id: id,
        },
      );
    }

    const memberOwner = await this.membersService.findOne({
      clanId: id,
      userId: memberId,
    });

    if (isOwner(memberOwner?.data?.roleCd)) {
      throw new ApiException(
        {
          id: ErrorCodeEnum.MEMBER_IS_OWNER,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          id: id,
        },
      );
    }

    return this.membersService.removeMember(id, memberId);
  }

  @ApiCookieAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: number): Promise<void> {
    return this.clanService.softDelete(id);
  }

  @ApiCookieAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @SerializeOptions({
    groups: ['admin'],
  })
  @Patch(':id/owner/change')
  @HttpCode(HttpStatus.OK)
  async changeOwner(
    @Param('id') id: number,
    @Body() changeOwnerDto: ChangeOwnerDto,
    @Req() request,
  ): Promise<BaseResponseDto<CreateMemberResponseType>> {
    const account = this.commonService.getAccountInformationLogin(request);

    const memberOwner = await this.membersService.findOne({
      clanId: id,
      userId: account.id,
    });

    if (!memberOwner.data) {
      throw new ApiException(
        {
          id: ErrorCodeEnum.MEMBER_NOT_PERMISSION,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          id: id,
        },
      );
    }
    if (!isOwner(memberOwner.data.roleCd)) {
      throw new ApiException(
        {
          id: ErrorCodeEnum.MEMBER_NOT_PERMISSION,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          id: id,
        },
      );
    }

    if (account.id === changeOwnerDto.userId) {
      throw new ApiException(
        {
          id: ErrorCodeEnum.MEMBER_IS_OWNER,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          id: id,
        },
      );
    }

    const memberExists = await this.membersService.findOne({
      clanId: id,
      userId: changeOwnerDto.userId,
    });

    if (!memberExists.data) {
      return this.membersService.update(memberOwner.data.id, changeOwnerDto);
    }

    const memberChangeOwner = await this.membersService.update(memberExists.data.id, {
      roleCd: AppConstant.ROLE_OWNER,
    });

    if (memberChangeOwner) {
      await this.membersService.update(memberOwner.data.id, {
        roleCd: AppConstant.ROLE_ADMIN,
      });
    }

    return memberChangeOwner;
  }

  @ApiCookieAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @HttpCode(HttpStatus.CREATED)
  @Post('collect-money')
  async createCollectMoney(
    @Body() createCollectMoney: CreateCollectMoneyDto,
    @Req() request: Request,
  ): Promise<BaseResponseDto<CreateCollectMoneyResponseType>> {
    const account = this.commonService.getAccountInformationLogin(request);
    await this.clanService.validateRoleMember(account.id, createCollectMoney.clanId);
    await this.clanService.findOne({ id: createCollectMoney.clanId });
    const user = await this.usersService.findOne({ id: createCollectMoney.userId });
    if (!user) {
      throw new ApiException(
        {
          userId: ErrorCodeEnum.USER_ID_NOT_FOUND,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const collectMoney = await this.collectMoneyService.create({
      ...createCollectMoney,
      ...{ createdBy: account.id },
    });
    return collectMoney;
  }

  @ApiCookieAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @HttpCode(HttpStatus.OK)
  @Patch('collect-money/:collectMoneyId')
  async updateCollectMoney(
    @Param('collectMoneyId') collectMoneyId: number,
    @Body() updateCollectMoneyDto: UpdateCollectMoneyDto,
  ): Promise<BaseResponseDto<CreateCollectMoneyResponseType>> {
    return await this.collectMoneyService.update(collectMoneyId, {
      ...updateCollectMoneyDto,
    });
  }

  @ApiCookieAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @HttpCode(HttpStatus.OK)
  @Get('collect-money/total-money/:clanId')
  async totalMoney(@Param('clanId') clanId: number): Promise<BaseResponseDto<number>> {
    await this.clanService.findOne({ id: clanId });
    return await this.collectMoneyService.totalCollectMoney(clanId);
  }

  @ApiCookieAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('collect-money/:collectId')
  async removeCollectMoney(@Param('collectId') collectId: number): Promise<void> {
    await this.collectMoneyService.softDelete(collectId);
  }
}
