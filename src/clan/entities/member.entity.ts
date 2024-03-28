import { BaseEntity } from 'src/utils/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Clan } from './clan.entity';
import { User } from 'src/users/entities/user.entity';

@Entity({ name: 'member' })
export class Member extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'clan_id' })
  clanId: number;

  @Column({ name: 'created_by' })
  createdBy: number;

  @Column({ name: 'role_cd', type: Number })
  roleCd: number;

  @ManyToOne((_type) => Clan, (clan) => clan.members)
  @JoinColumn({ name: 'clan_id' })
  clan: Clan;

  @ManyToOne((_type) => User, (user) => user.members)
  @JoinColumn({ name: 'user_id' })
  members: User;
}
