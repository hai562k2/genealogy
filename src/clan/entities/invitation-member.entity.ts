import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('invitation_member')
export class InvitationMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: Number })
  userId: number;

  @Column({ name: 'mid', type: Number })
  motherId: number;

  @Column({ name: 'fid', type: Number })
  fatherId: number;

  @Column({ name: 'pid', type: Number })
  partnerId: number;

  @Column({ name: 'gender', type: Number })
  gender: number;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'clan_name' })
  clanName: string;

  @Column({ name: 'clan_id', type: Number })
  clanId: number;

  @Column({ type: String, unique: true, nullable: true })
  email: string;

  @Column({ name: 'role_cd', type: Number })
  roleCd: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true, default: () => 'NULL', select: false })
  deletedAt: Date;
}
