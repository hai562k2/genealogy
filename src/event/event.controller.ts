import { Body, Controller, HttpCode, HttpStatus, Param, Patch, Post, Req, Get, Delete } from '@nestjs/common';
import { EventCommentService } from './event-comment.service';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Request } from 'express';
import { CreateEventResponseType } from './types/create-event-response.type';
import { BaseResponseDto } from 'src/utils/dto/base-response.dto';
import { CommonService } from 'src/utils/services/common.service';
import { ClanService } from 'src/clan/clan.service';
import { FileEntity } from 'src/files/entities/file.entity';
import { getValueOrDefault, isNotEmptyField } from 'src/utils';
import { FilesService } from 'src/files/files.service';
import { ApiTags } from '@nestjs/swagger';
import { FilterEventDto } from './dto/filter-event.dto';
import { ListEventResponseType } from './types/list-event-response.type';
import { UpdateEventDto } from './dto/upate-event.dto';

@ApiTags('Event')
@Controller({
  path: 'event',
  version: '1',
})
export class EventController {
  constructor(
    private readonly eventCommentService: EventCommentService,
    private readonly eventService: EventService,
    private readonly commonService: CommonService,
    private readonly clanService: ClanService,
    private readonly filesService: FilesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createEventDto: CreateEventDto,
    @Req() request: Request,
  ): Promise<BaseResponseDto<CreateEventResponseType>> {
    const account = this.commonService.getAccountInformationLogin(request);

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

  @Post('list')
  @HttpCode(HttpStatus.OK)
  findAll(
    @Body() paginationDto: FilterEventDto,
    @Req() request: Request,
  ): Promise<BaseResponseDto<ListEventResponseType>> {
    const account = this.commonService.getAccountInformationLogin(request);
    paginationDto.page = Number(paginationDto.page);
    paginationDto.limit = Number(paginationDto.limit);

    return this.eventService.findManyWithPagination(paginationDto, account.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: number): Promise<BaseResponseDto<CreateEventResponseType>> {
    const event = await this.eventService.findOne({ id });
    return event;
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: number,
    @Body() updateEventDto: UpdateEventDto,
    @Req() request: Request,
  ): Promise<BaseResponseDto<CreateEventResponseType>> {
    const account = this.commonService.getAccountInformationLogin(request);
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
  async remove(@Param('id') id: number, @Req() request: Request): Promise<void> {
    const account = this.commonService.getAccountInformationLogin(request);
    const event = await this.eventService.findOne({ id });

    await this.clanService.validateRoleOwnerOrCreatedBy(
      account.id,
      getValueOrDefault(event.data?.clanId, 0),
      getValueOrDefault(event.data?.createdBy, 0),
    );

    await this.eventService.softDelete(id);
  }
}
