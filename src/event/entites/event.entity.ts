import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/utils/entity/base.entity';
import { AfterInsert, AfterLoad, AfterUpdate, BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';

@Entity({ name: 'event' })
export class EventEntity extends BaseEntity {
  @Column({ name: 'clan_id' })
  clanId: number;

  @Column({ name: 'created_by' })
  createdBy: number;

  @Column()
  content: string;

  @Column({ name: 'time_event' })
  timeEvent: Date;

  @Column({ type: String, nullable: true })
  image: string;

  @Exclude()
  @Column({ insert: false, update: false, select: false })
  images: string;

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
