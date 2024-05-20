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
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Status } from '../../statuses/entities/status.entity';
import bcrypt from 'bcryptjs';
import { EntityHelper } from 'src/utils/entity-helper';
import { AuthProvidersEnum } from 'src/auth/auth-providers.enum';
import { Exclude, Expose } from 'class-transformer';
import { getValueOrDefault } from 'src/utils';
import { Member } from 'src/clan/entities/member.entity';
import { EventEntity } from 'src/event/entities/event.entity';
import { CollectMoney } from 'src/clan/entities/collect-money.entity';
import { EventComment } from 'src/event/entities/event-comment.entity';

@Entity()
export class User extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  // For "string | null" we need to use String type.
  // More info: https://github.com/typeorm/typeorm/issues/2567
  @Column({ type: String, unique: true, nullable: true })
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
  image: string;

  @Exclude()
  @Column({ insert: false, update: false, select: false })
  images: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  birthday: Date;

  @Column({ name: 'lunar_birthday', nullable: true })
  lunarBirthday: Date;

  @Column({ type: String, nullable: true })
  country: string;

  @Column({ type: String, nullable: true })
  phone: string;

  @Column({ type: String, nullable: true })
  job: string;

  @Column({ name: 'wor_address', type: String, nullable: true })
  workAddress: string;

  @Column({ name: 'fid', nullable: true })
  fatherId: number;

  @Column({ name: 'father_name' })
  fatherName: string;

  @Column({ name: 'mid', nullable: true })
  motherId: number;

  @Column({ name: 'mother_name' })
  motherName: string;

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
  partnerId: number[] | null;

  @Column({ type: String, nullable: true })
  description: string;

  @Column({ name: 'dead_day' })
  deadDay: Date;

  @Column({ name: 'lunar_dead_day' })
  lunarDeadDay: Date;

  @BeforeInsert()
  @BeforeUpdate()
  convertImage() {
    this.image = JSON.stringify(this.images);
  }

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  convertPublishToArray() {
    const images = getValueOrDefault(this.image, []);
    this.image = typeof images === 'string' ? JSON.parse(images) : JSON.parse(JSON.stringify(images));
  }

  @OneToMany((_type) => Member, (member) => member.members, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @Expose({ groups: ['login'] })
  members: Member;

  @Expose({ groups: ['login'] })
  @OneToOne((_type) => EventEntity, (event) => event.user, {
    eager: false,
  })
  event: EventEntity;

  @Expose({ groups: ['login'] })
  @OneToOne((_type) => EventComment, (eventComment) => eventComment.user, {
    eager: false,
  })
  eventComment: EventComment;

  @OneToOne(() => CollectMoney, (collectMoney) => collectMoney.user)
  collectMoney: CollectMoney;
}
