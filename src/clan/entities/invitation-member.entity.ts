import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('invitation_member')
export class InvitationMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'mid' })
  motherId: number;

  @Column({ name: 'fid' })
  fatherId: number;
  @Column('bigint', {
    name: 'pids',
    array: true,
    transformer: {
      to: (value: number[] | null) => {
        if (value === null) {
          return null;
        }
        return value;
      },
      from: (value: string[] | null) => {
        if (value === null) {
          return null;
        }
        return value.map(Number);
      },
    },
  })
  partnerId: number[];

  @Column({ name: 'gender', type: String })
  gender: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'clan_name' })
  clanName: string;

  @Column({ name: 'clan_id' })
  clanId: number;

  @Column({ type: String, unique: true, nullable: true })
  email: string;

  @Column({ name: 'role_cd' })
  roleCd: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true, default: () => 'NULL', select: false })
  deletedAt: Date;
}
