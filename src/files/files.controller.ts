import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Response,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FilesService } from './files.service';
import { FileEntity } from './entities/file.entity';
import { BaseResponseDto } from 'src/utils/dto/base-response.dto';
import { ResponseHelper } from 'src/utils/helpers/response.helper';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { S3 } from '@aws-sdk/client-s3';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';
import { DeleteFileDto } from './dto/delete-file.dto';

@ApiTags('Files')
@Controller({
  path: 'files',
  version: '1',
})
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFile(
    @UploadedFiles() files: Array<Express.Multer.File> | Array<Express.MulterS3.File>,
  ): Promise<BaseResponseDto<FileEntity[]>> {
    const fileResponse: FileEntity[] = [];
    for (const file of files) {
      const fileUpload = await this.filesService.uploadFile(file);
      fileResponse.push(fileUpload);
    }

    return ResponseHelper.success(fileResponse);
  }

  @Get(':path')
  getFileByKeyS3(@Param('path') path: string, @Response() response) {
    const s3 = new S3({
      region: this.configService.get('file.awsS3Region', { infer: true }),
      credentials: {
        accessKeyId: this.configService.getOrThrow('file.accessKeyId', {
          infer: true,
        }),
        secretAccessKey: this.configService.getOrThrow('file.secretAccessKey', { infer: true }),
      },
    });

    const params = {
      Bucket: this.configService.get('file.awsDefaultS3Bucket', { infer: true }),
      Key: path,
    };
    s3.getObject(params, (err, data) => {
      if (err) {
        return response.status(HttpStatus.UNPROCESSABLE_ENTITY).send(ResponseHelper.error(ErrorCodeEnum.FILE_INVALID));
      }

      response.setHeader('Content-Type', data.ContentType);
      if (data.ContentType.match(/^image\//)) {
        response.setHeader('Cache-Control', 'public,max-age=86400,immutable');
      }
      return data.Body.pipe(response);
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Body() deleteFileDto: DeleteFileDto) {
    this.filesService.deleteFile(deleteFileDto.path || []);

    return this.filesService.bulkRemove(deleteFileDto.path);
  }
}
