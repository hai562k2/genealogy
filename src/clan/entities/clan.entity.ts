import { Exclude, Expose } from 'class-transformer';
import { EventEntity } from 'src/event/entities/event.entity';
import { BaseEntity } from 'src/utils/entity/base.entity';
import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Member } from './member.entity';

@Entity({ name: 'clan' })
export class Clan extends BaseEntity {
  @Column()
  name: string;

  @Column()
  information: string;

  @Column()
  rule: string;

  @Column({ name: 'created_by' })
  createdBy: number;

  @Column({ type: String, nullable: true })
  @Expose({ groups: ['admin'] })
  image: string;

  @Exclude()
  @Column({ insert: false, update: false, select: false })
  images: string;

  @OneToOne((_type) => EventEntity, (event) => event.clan, {
    lazy: true,
  })
  event: Clan;

  @Expose({ groups: ['admin'] })
  @OneToMany((_type) => Member, (member) => member.clan, {
    lazy: true,
    onDelete: 'CASCADE',
  })
  members: Member;

  @BeforeInsert()
  @BeforeUpdate()
  convertPublish() {
    this.image = JSON.stringify(this.images);
  }

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  convertPublishToArray() {
    const images = typeof this.image === 'string' ? JSON.parse(this.image) : JSON.parse(JSON.stringify(this.image));
    this.image = images ?? [];
  }
}
