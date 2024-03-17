import { Column, Entity, PrimaryGeneratedColumn, AfterLoad, AfterInsert } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { EntityHelper } from 'src/utils/entity-helper';
import appConfig from '../../config/app.config';
import { AppConfig } from 'src/config/config.type';

@Entity({ name: 'file' })
export class FileEntity extends EntityHelper {
  @ApiProperty({ example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Allow()
  @Column()
  path: string;

  @Allow()
  @Column()
  name: string;

  @AfterLoad()
  @AfterInsert()
  updatePath() {
    if (this.path.startsWith('/')) {
      this.path = (appConfig() as AppConfig).backendDomain + this.path;
    }
  }
}