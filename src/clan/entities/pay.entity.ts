import { BaseEntity } from 'src/utils/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Clan } from './clan.entity';

@Entity({ name: 'pay' })
export class Pay extends BaseEntity {
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

  @ManyToOne((_type) => Clan, (clan) => clan.pays)
  @JoinColumn({ name: 'clan_id' })
  clan: Clan;
}
