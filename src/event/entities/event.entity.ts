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
  OneToMany,
  OneToOne,
} from 'typeorm';
import { EventComment } from './event-comment.entity';
import { Clan } from 'src/clan/entities/clan.entity';
import { User } from 'src/users/entities/user.entity';

@Entity({ name: 'event' })
export class EventEntity extends BaseEntity {
  @Column({ name: 'clan_id' })
  clanId: number;

  @Column({ name: 'created_by' })
  createdBy: number;

  @Column()
  content: string;

  @Column({ name: 'time_event', type: 'timestamp' })
  timeEvent: Date;

  @Column({ type: String, nullable: true })
  image: string;

  @Exclude()
  @Column({ insert: false, update: false, select: false })
  images: string;

  @OneToMany((_type) => EventComment, (comment) => comment.event)
  comments: EventComment[];

  @OneToOne((_type) => Clan, (clan) => clan.event)
  @JoinColumn({ name: 'clan_id' })
  clan: Clan;

  @OneToOne((_type) => User, (user) => user.event)
  @JoinColumn({ name: 'created_by' })
  user: User;

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
