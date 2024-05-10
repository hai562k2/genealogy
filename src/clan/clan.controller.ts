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
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ClanService } from './clan.service';
import { RoleEnum } from 'src/roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { CreateClanDto } from './dto/create-clan.dto';
import { BaseResponseDto } from 'src/utils/dto/base-response.dto';
import { CreateClanResponseType } from './types/create-clan-response.type';
import { FileEntity } from 'src/files/entities/file.entity';
import { getValueOrDefault, isAdminOrOwner, isNotEmptyField, isOwner } from 'src/utils';
import { FilesService } from 'src/files/files.service';
import { CommonService } from 'src/utils/services/common.service';
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
import { FilterPayDto } from './dto/filter-pay.dto';
import { PayService } from './pay.service';
import { CreatePayDto } from './dto/create-pay.dto';
import { CreatePayResponseType } from './types/create-pay-response.type';
import { UpdatePayDto } from './dto/update-pay.dto';
import { ResponseHelper } from 'src/utils/helpers/response.helper';
import { InviteMemberDto } from './dto/invite-member.dto';
import { ActiveMemberDto } from './dto/active-member.dto';
import { InvitationMember } from './entities/invitation-member.entity';
import { UpdateClanDto } from './dto/update-clan.dto';
import { FilterMemberDto } from './dto/filter-member.dto';
import { UpdateRoleMemberDto } from './dto/update-role-member.dto';
import { RemoveMemberDto } from './dto/remove-member.dto';

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
    private readonly payService: PayService,
  ) {}

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @SerializeOptions({
    groups: ['admin'],
  })
  @Post()
  @HttpCode(HttpStatus.OK)
  async create(@Body() createClanDto: CreateClanDto, @Req() request): Promise<BaseResponseDto<CreateClanResponseType>> {
    const account = request.user;
    let images: FileEntity[] = [];
    if (isNotEmptyField(createClanDto.image)) {
      images = await this.filesService.findAllByPath(createClanDto.image);
    }

    const clan = await this.clanService.create({
      ...createClanDto,
      ...{ createdBy: account.id },
      ...{
        images: images.map((image) => image.path),
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

  @ApiBearerAuth()
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
  @ApiQuery({ name: 'description', required: false, type: String })
  findAllCollectMoney(
    @Query() paginationDto: FilterCollectMoneyDto,
    @Req() request,
  ): Promise<BaseResponseDto<ListClanResponseType>> {
    paginationDto.page = Number(paginationDto.page);
    paginationDto.limit = Number(paginationDto.limit);
    const account = request.user;

    return this.collectMoneyService.findManyWithPagination(paginationDto, account.id);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get('read-invitation-token')
  @ApiQuery({ name: 'token', required: false, type: String })
  async getInfoUuid(@Query() token: ActiveMemberDto): Promise<BaseResponseDto<Readonly<InvitationMember>>> {
    return await this.clanService.readUuidInvite(token);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @SerializeOptions({
    groups: ['detail'],
  })
  @Get('collect-money/:collectId')
  @HttpCode(HttpStatus.OK)
  async findOneCollectMoney(
    @Param('collectId') collectId: number,
  ): Promise<BaseResponseDto<CreateCollectMoneyResponseType>> {
    return await this.collectMoneyService.findOne({ id: collectId });
  }

  @ApiBearerAuth()
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
  findAll(@Query() paginationDto: FilterClanDto, @Req() request): Promise<BaseResponseDto<ListClanResponseType>> {
    paginationDto.page = Number(paginationDto.page);
    paginationDto.limit = Number(paginationDto.limit);

    return this.clanService.findManyWithPagination(paginationDto, request.user.id);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: number): Promise<BaseResponseDto<CreateClanResponseType>> {
    return await this.clanService.findOne({ id });
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get('role-member/user')
  @HttpCode(HttpStatus.OK)
  async getRoleMember(@Query() filterDto: FilterMemberDto): Promise<BaseResponseDto<CreateMemberResponseType>> {
    return await this.membersService.findOne({ userId: +filterDto.userId, clanId: +filterDto.clanId });
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get('role-member/:clanId')
  @HttpCode(HttpStatus.OK)
  async getRoleCurenUserMember(
    @Param('clanId') clanId: number,
    @Req() request,
  ): Promise<BaseResponseDto<CreateMemberResponseType>> {
    return await this.membersService.findOne({ userId: request.user.id, clanId: clanId });
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @SerializeOptions({
    groups: ['admin'],
  })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: number,
    @Body() updateClanDto: UpdateClanDto,
  ): Promise<BaseResponseDto<CreateClanResponseType>> {
    let images: FileEntity[] = [];
    if (isNotEmptyField(updateClanDto.image)) {
      images = await this.filesService.findAllByPath(updateClanDto.image);
    }
    return await this.clanService.update(id, {
      ...updateClanDto,
      ...{
        images: images.map((image) => image.path),
      },
    });
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @SerializeOptions({
    groups: ['admin'],
  })
  @Post(':id/members/invite')
  @HttpCode(HttpStatus.OK)
  async inviteMember(@Param('id') id: number, @Body() dto: InviteMemberDto, @Req() request): Promise<void> {
    const member = await this.membersService.findOne({
      clanId: id,
      userId: request.user.id,
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
    return await this.clanService.inviteMember(dto, id);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @Delete('clan/remove/member')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMembersByOrganization(@Query() removeMember: RemoveMemberDto, @Req() request): Promise<void> {
    const account = request.user;

    const member = await this.membersService.findOne({
      clanId: +removeMember.id,
      userId: account.id,
    });

    if (!isAdminOrOwner(member?.data?.roleCd)) {
      throw new ApiException(
        {
          id: ErrorCodeEnum.MEMBER_NOT_PERMISSION,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          id: removeMember.id,
        },
      );
    }

    const memberOwner = await this.membersService.findOne({
      clanId: removeMember.id,
      userId: removeMember.userId,
    });

    if (isOwner(memberOwner?.data?.roleCd)) {
      throw new ApiException(
        {
          id: ErrorCodeEnum.MEMBER_IS_OWNER,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          id: removeMember.id,
        },
      );
    }

    return this.membersService.removeMember(removeMember.id, removeMember.userId);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: number): Promise<void> {
    return this.clanService.softDelete(id);
  }

  @ApiBearerAuth()
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
    const account = request.user;

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

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @HttpCode(HttpStatus.CREATED)
  @Post('collect-money')
  async createCollectMoney(
    @Body() createCollectMoney: CreateCollectMoneyDto,
    @Req() request,
  ): Promise<BaseResponseDto<CreateCollectMoneyResponseType>> {
    const account = request.user;
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

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @HttpCode(HttpStatus.OK)
  @Patch('collect-money/:collectMoneyId')
  async updateCollectMoney(
    @Param('collectMoneyId') collectMoneyId: number,
    @Body() updateCollectMoneyDto: UpdateCollectMoneyDto,
    @Req() request,
  ): Promise<BaseResponseDto<CreateCollectMoneyResponseType>> {
    const account = request.user;
    const collectMoney = await this.collectMoneyService.findOne({ id: collectMoneyId });
    await this.clanService.validateRoleMember(account.id, getValueOrDefault(collectMoney.data?.clanId, 0));
    return await this.collectMoneyService.update(collectMoneyId, {
      ...updateCollectMoneyDto,
    });
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @HttpCode(HttpStatus.OK)
  @Get('collect-money/total-money/:clanId')
  async totalMoney(@Param('clanId') clanId: number): Promise<BaseResponseDto<number>> {
    await this.clanService.findOne({ id: clanId });
    const collectMoney = await this.collectMoneyService.totalCollectMoney(clanId);
    const payMoney = await this.payService.getTotalPay(clanId);
    return ResponseHelper.success(collectMoney - payMoney);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('collect-money/:collectId')
  async removeCollectMoney(@Param('collectId') collectId: number): Promise<void> {
    await this.collectMoneyService.softDelete(collectId);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get('pay/list')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ApiQuery({ name: 'id', required: false, type: Number })
  @ApiQuery({ name: 'clanId', required: false, type: Number })
  findAllPay(@Query() paginationDto: FilterPayDto, @Req() request): Promise<BaseResponseDto<ListClanResponseType>> {
    paginationDto.page = Number(paginationDto.page);
    paginationDto.limit = Number(paginationDto.limit);
    const account = request.user;

    return this.payService.findManyWithPagination(paginationDto, account.id);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @HttpCode(HttpStatus.CREATED)
  @Post('pay')
  async createPay(@Body() createPayDto: CreatePayDto, @Req() request): Promise<BaseResponseDto<CreatePayResponseType>> {
    const account = request.user;
    await this.clanService.validateRoleMember(account.id, createPayDto.clanId);
    const clan = await this.clanService.findOne({ id: createPayDto.clanId });
    const totalCollectMoney = await this.collectMoneyService.totalCollectMoney(getValueOrDefault(clan.data?.id, 0));
    const totalPayMoneyAfterInsert =
      (await this.payService.getTotalPay(getValueOrDefault(clan.data?.id, 0))) + createPayDto.money;
    if (totalCollectMoney - totalPayMoneyAfterInsert < 0) {
      throw new ApiException(
        {
          money: ErrorCodeEnum.MONEY_NOT_ENOUGH,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        { createPayDto },
      );
    }

    const collect = await this.payService.create({
      ...createPayDto,
      ...{ createdBy: account.id },
    });
    return collect;
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @HttpCode(HttpStatus.OK)
  @Patch('pay/:payId')
  async updatePay(
    @Param('payId') payId: number,
    @Body() updatePayDto: UpdatePayDto,
    @Req() request,
  ): Promise<BaseResponseDto<CreatePayResponseType>> {
    const account = request.user;
    const pay = await this.payService.findOne({ id: payId });
    await this.clanService.validateRoleMember(account.id, getValueOrDefault(pay.data?.clanId, 0));

    await this.clanService.findOne({ id: pay.data?.clanId });
    if (updatePayDto.money) {
      const totalCollectMoney = await this.collectMoneyService.totalCollectMoney(getValueOrDefault(pay.data?.id, 0));
      const totalPayMoneyAfterInsert =
        (await this.payService.getTotalPay(getValueOrDefault(pay.data?.id, 0))) -
        getValueOrDefault(pay.data?.money, 0) +
        updatePayDto.money;
      if (totalCollectMoney - totalPayMoneyAfterInsert < 0) {
        throw new ApiException(
          {
            money: ErrorCodeEnum.MONEY_NOT_ENOUGH,
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
          { updatePayDto },
        );
      }
    }

    return await this.payService.update(payId, {
      ...updatePayDto,
    });
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @SerializeOptions({
    groups: ['detail'],
  })
  @Get('pay/:payId')
  @HttpCode(HttpStatus.OK)
  async findOnePay(@Param('payId') payId: number): Promise<BaseResponseDto<CreatePayResponseType>> {
    return await this.payService.findOne({ id: payId });
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('pay/:payId')
  async removePay(@Param('payId') payId: number): Promise<void> {
    await this.payService.softDelete(payId);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @HttpCode(HttpStatus.OK)
  @Patch('member/profile')
  async updateMember(@Body() updateRoleMemberDto: UpdateRoleMemberDto, @Req() request): Promise<void> {
    const account = request.user;
    const member = await this.membersService.findOne({
      userId: updateRoleMemberDto.userId,
      clanId: updateRoleMemberDto.clanId,
    });
    await this.clanService.validateRoleMember(account.id, getValueOrDefault(updateRoleMemberDto.clanId, 0));
    await this.membersService.update(getValueOrDefault(member.data?.id, 0), { roleCd: updateRoleMemberDto.roleCd });
  }
}
