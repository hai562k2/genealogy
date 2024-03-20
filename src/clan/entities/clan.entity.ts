import { BaseEntity } from 'src/utils/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'clan' })
export class Clan extends BaseEntity {
  @Column()
  name: string;

  @Column()
  information: string;

  @Column()
  rule: string;

  @Column()
  createdBy: number;
}
