import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { Repository } from 'typeorm';
import { AllConfigType } from 'src/config/config.type';
import { ApiException } from 'src/utils/exceptions/api.exception';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';
import { S3 } from '@aws-sdk/client-s3';
import { AppConstant } from 'src/utils/app.constant';

@Injectable()
export class FilesService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {}

  async uploadFile(file: Express.Multer.File | Express.MulterS3.File): Promise<FileEntity> {
    if (!file) {
      throw new ApiException(
        {
          id: ErrorCodeEnum.FILE_REQUIRED,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const path = {
      local: `/${this.configService.get('app.apiPrefix', { infer: true })}/v1/${file.path}`,
      s3: (file as Express.MulterS3.File).key,
    };

    const url = this.configService.getOrThrow('app.backendDomain', { infer: true });
    const apiPrefix = this.configService.getOrThrow('app.apiPrefix', { infer: true });

    const filePath =
      url +
      '/' +
      apiPrefix +
      AppConstant.MIDDLE_PATH +
      path[this.configService.getOrThrow('file.driver', { infer: true })];
    const filePathTransform = filePath.replace('images/', 'images%2F');

    return this.fileRepository.save(
      this.fileRepository.create({
        path: filePathTransform,
        name: file.originalname,
      }),
    );
  }

  deleteFile(path: string[]) {
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
      Delete: {
        Objects: path.map((file) => {
          return { Key: file };
        }),
      },
    };
    s3.deleteObjects(params, (err) => {
      if (err) {
        return false;
      }

      return true;
    });
  }

  async bulkRemove(path: FileEntity['path'][]): Promise<void> {
    await this.fileRepository
      .createQueryBuilder()
      .delete()
      .where('path IN (:...path)', {
        path: path,
      })
      .execute();
  }

  async findAllByPath(paths): Promise<FileEntity[]> {
    return this.fileRepository.createQueryBuilder().where('path IN (:...paths)', { paths }).getMany();
  }
}
