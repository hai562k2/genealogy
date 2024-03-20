import { BaseEntity } from 'src/utils/entity/base.entity';
import { Column, Entity } from 'typeorm';

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
}
