import {
  Column,
  AfterLoad,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  AfterInsert,
  AfterUpdate,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Status } from '../../statuses/entities/status.entity';
import bcrypt from 'bcryptjs';
import { EntityHelper } from 'src/utils/entity-helper';
import { AuthProvidersEnum } from 'src/auth/auth-providers.enum';
import { Exclude, Expose } from 'class-transformer';
import { getValueOrDefault } from 'src/utils';

@Entity()
export class User extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  // For "string | null" we need to use String type.
  // More info: https://github.com/typeorm/typeorm/issues/2567
  @Column({ type: String, unique: true, nullable: true })
  @Expose({ groups: ['me', 'admin'] })
  email: string | null;

  @Column({ type: String, nullable: true })
  @Index()
  @Exclude({ toPlainOnly: true })
  otpSecret: string;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Exclude({ toPlainOnly: true })
  public previousPassword: string;

  @AfterLoad()
  public loadPreviousPassword(): void {
    this.previousPassword = this.password;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async setPassword() {
    if (this.previousPassword !== this.password && this.password) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  @Column({ default: AuthProvidersEnum.email })
  @Expose({ groups: ['login'] })
  provider: string;

  @Index()
  @Column({ type: String, nullable: true })
  @Expose({ groups: ['login'] })
  socialId: string | null;

  @Index()
  @Column({ type: String, nullable: true })
  name: string | null;

  @ManyToOne(() => Role, {
    eager: true,
  })
  @Expose({ groups: ['login'] })
  role?: Role | null;

  @ManyToOne(() => Status, {
    eager: true,
  })
  status?: Status;

  @Column({ type: String, nullable: true })
  @Index()
  @Exclude({ toPlainOnly: true })
  hash: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @Exclude({ toPlainOnly: true })
  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @Exclude({ toPlainOnly: true })
  @DeleteDateColumn({ select: false })
  deletedAt: Date;

  @Column({ type: String, nullable: true })
  file: string;

  @Exclude()
  @Column({ insert: false, update: false, select: false })
  files: string;

  @BeforeInsert()
  @BeforeUpdate()
  convertFile() {
    this.file = JSON.stringify(this.files);
  }

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  convertPublishToArray() {
    const images = getValueOrDefault(this.file, []);
    this.file = typeof images === 'string' ? JSON.parse(images) : JSON.parse(JSON.stringify(images));
  }
}
