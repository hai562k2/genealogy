import { BaseEntity } from 'src/utils/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Clan } from './clan.entity';
import { User } from 'src/users/entities/user.entity';

@Entity({ name: 'collect_money' })
export class CollectMoney extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'clan_id' })
  clanId: number;

  @Column({ name: 'description' })
  description: string;

  @Column({ name: 'created_by' })
  createdBy: number;

  @Column({ name: 'money', type: Number })
  money: number;

  @OneToOne((_type) => User, (user) => user.collectMoney)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne((_type) => Clan, (clan) => clan.collectMoneys)
  @JoinColumn({ name: 'clan_id' })
  clan: Clan;
}
