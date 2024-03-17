import { HttpStatus, Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { FilesService } from './files.service';
import { AllConfigType } from 'src/config/config.type';
import { ApiException } from 'src/utils/exceptions/api.exception';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';
import { AppConstant } from 'src/utils/app.constant';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>) => {
        const storages = {
          local: () =>
            diskStorage({
              destination: './files',
              filename: (request, file, callback) => {
                let folderUpload = AppConstant.FOLDER_UPLOAD_FILE;
                if (file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
                  folderUpload = AppConstant.FOLDER_UPLOAD_IMAGE;
                }
                callback(
                  null,
                  `${folderUpload}/${randomStringGenerator()}.${file.originalname.split('.').pop()?.toLowerCase()}`,
                );
              },
            }),
          s3: () => {
            const s3 = new S3Client({
              region: configService.get('file.awsS3Region', { infer: true }),
              credentials: {
                accessKeyId: configService.getOrThrow('file.accessKeyId', {
                  infer: true,
                }),
                secretAccessKey: configService.getOrThrow('file.secretAccessKey', { infer: true }),
              },
            });

            return multerS3({
              s3: s3,
              bucket: configService.getOrThrow('file.awsDefaultS3Bucket', {
                infer: true,
              }),
              contentType: multerS3.AUTO_CONTENT_TYPE,
              key: (request, file, callback) => {
                let folderUpload = AppConstant.FOLDER_UPLOAD_FILE;
                if (file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
                  folderUpload = AppConstant.FOLDER_UPLOAD_IMAGE;
                }

                callback(
                  null,
                  `${folderUpload}/${randomStringGenerator()}.${file.originalname.split('.').pop()?.toLowerCase()}`,
                );
              },
            });
          },
        };

        return {
          fileFilter: (request, file, callback) => {
            if (!file) {
              return callback(
                new ApiException(ErrorCodeEnum.FILE_REQUIRED, HttpStatus.UNPROCESSABLE_ENTITY, file),
                false,
              );
            }
            file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif|csv|xls|xlsx|pdf|docx|doc)$/i)) {
              return callback(
                new ApiException(ErrorCodeEnum.FILE_INVALID, HttpStatus.UNPROCESSABLE_ENTITY, file),
                false,
              );
            }

            callback(null, true);
          },
          storage: storages[configService.getOrThrow('file.driver', { infer: true })](),
          limits: {
            fileSize: configService.get('file.maxFileSize', { infer: true }),
            files: configService.get('file.maxFileUpload', { infer: true }),
          },
          encoding: 'utf-8',
        };
      },
    }),
  ],
  controllers: [FilesController],
  providers: [ConfigModule, ConfigService, FilesService],
})
export class FilesModule {}
