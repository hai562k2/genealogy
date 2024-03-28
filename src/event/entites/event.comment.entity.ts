import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/utils/entity/base.entity';
import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { EventEntity } from './event.entity';

@Entity({ name: 'event_comment' })
export class EventComment extends BaseEntity {
  @Column({ name: 'event_id' })
  eventId: number;

  @Column({ name: 'created_by' })
  createdBy: number;

  @Column()
  content: string;

  @Column({ type: String, nullable: true })
  image: string;

  @Exclude()
  @Column({ insert: false, update: false, select: false })
  images: string;

  @ManyToOne((_type) => EventEntity, (event) => event.comments)
  @JoinColumn({ name: 'event_id' })
  event: EventEntity;

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
