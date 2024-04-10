import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Get,
  Delete,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { EventCommentService } from './event-comment.service';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateEventResponseType } from './types/create-event-response.type';
import { BaseResponseDto } from 'src/utils/dto/base-response.dto';
import { ClanService } from 'src/clan/clan.service';
import { FileEntity } from 'src/files/entities/file.entity';
import { getValueOrDefault, isNotEmptyField } from 'src/utils';
import { FilesService } from 'src/files/files.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FilterEventDto } from './dto/filter-event.dto';
import { ListEventResponseType } from './types/list-event-response.type';
import { UpdateEventDto } from './dto/upate-event.dto';
import { CreateEventCommentResponseType } from './types/create-event-comment-response.type';
import { CreateEventCommentDto } from './dto/create-event-comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { RoleEnum } from 'src/roles/roles.enum';

@ApiTags('Event')
@Controller({
  path: 'event',
  version: '1',
})
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@Roles(RoleEnum.admin, RoleEnum.user)
export class EventController {
  constructor(
    private readonly eventCommentService: EventCommentService,
    private readonly eventService: EventService,
    private readonly clanService: ClanService,
    private readonly filesService: FilesService,
  ) {}

  @Get('list')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'clanId', required: false, type: Number })
  async findAll(
    @Query() paginationDto: FilterEventDto,
    @Req() request,
  ): Promise<BaseResponseDto<ListEventResponseType>> {
    const account = request.user;

    paginationDto.page = Number(paginationDto.page);
    paginationDto.limit = Number(paginationDto.limit);

    return await this.eventService.findManyWithPagination(paginationDto, account.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: number): Promise<BaseResponseDto<CreateEventResponseType>> {
    const event = await this.eventService.findOne({ id });
    return event;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createEventDto: CreateEventDto,
    @Req() request,
  ): Promise<BaseResponseDto<CreateEventResponseType>> {
    const account = request.user;

    await this.clanService.validateMember(account.id, createEventDto.clanId);

    let images: FileEntity[] = [];
    if (isNotEmptyField(createEventDto.image)) {
      images = await this.filesService.findAllByPath(createEventDto.image);
    }

    const eventCreate = await this.eventService.create({
      ...createEventDto,
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

    return eventCreate;
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: number,
    @Body() updateEventDto: UpdateEventDto,
    @Request() request,
  ): Promise<BaseResponseDto<CreateEventResponseType>> {
    const account = request.user;
    const event = await this.eventService.findOne({ id });

    await this.clanService.validateRoleOwnerOrCreatedBy(
      account.id,
      getValueOrDefault(event.data?.clanId, 0),
      getValueOrDefault(event.data?.createdBy, 0),
    );

    let images: FileEntity[] = [];
    if (isNotEmptyField(updateEventDto.image)) {
      images = await this.filesService.findAllByPath(updateEventDto.image);
    }

    const questionUpdate = await this.eventService.update(id, {
      ...updateEventDto,
      ...{
        images: images.map((image) => {
          return {
            path: image.path,
            name: image.name,
          };
        }),
      },
    });

    return questionUpdate;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: number, @Req() request): Promise<void> {
    const event = await this.eventService.findOne({ id });

    await this.clanService.validateRoleOwnerOrCreatedBy(
      request.user.id,
      getValueOrDefault(event.data?.clanId, 0),
      getValueOrDefault(event.data?.createdBy, 0),
    );

    await this.eventService.softDelete(id);
  }

  @Post('comment')
  @HttpCode(HttpStatus.CREATED)
  async createEventComment(
    @Body() createEventCommentDto: CreateEventCommentDto,
    @Req() request,
  ): Promise<BaseResponseDto<CreateEventCommentResponseType>> {
    const account = request.user;
    const event = await this.eventService.findOne({ id: createEventCommentDto.eventId });

    await this.clanService.validateMember(account.id, getValueOrDefault(event.data?.clanId, 0));

    let images: FileEntity[] = [];
    if (isNotEmptyField(createEventCommentDto.image)) {
      images = await this.filesService.findAllByPath(createEventCommentDto.image);
    }

    const eventComment = await this.eventCommentService.create({
      ...createEventCommentDto,
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

    return eventComment;
  }
}
