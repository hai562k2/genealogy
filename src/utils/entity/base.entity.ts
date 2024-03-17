import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';

export class BaseEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true, default: () => 'NULL', select: true })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true, default: () => 'NULL', select: false })
  deletedAt: Date;
}
