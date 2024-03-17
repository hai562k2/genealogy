import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { Brackets, DeepPartial, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { NullableType } from '../utils/types/nullable.type';
import { CommonService } from 'src/utils/services/common.service';
import { AuthRegisterLoginDto } from 'src/auth/dto/auth-register-login.dto';
import { EmailExistsDto } from 'src/auth/dto/email-exists.dto';
import { RoleEnum } from 'src/roles/roles.enum';
import { StatusEnum } from 'src/statuses/statuses.enum';
import { User } from './entities/user.entity';
import { AppConstant } from 'src/utils/app.constant';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private commonService: CommonService,
  ) {}

  create(createProfileDto: CreateUserDto): Promise<User> {
    return this.usersRepository.save(this.usersRepository.create(createProfileDto));
  }

  findManyWithPagination(paginationOptions: IPaginationOptions): Promise<User[]> {
    return this.usersRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });
  }

  findOne(fields: EntityCondition<User>): Promise<NullableType<User>> {
    return this.usersRepository.findOne({
      where: fields,
    });
  }

  update(id: User['id'], payload: DeepPartial<User>): Promise<User> {
    return this.usersRepository.save(
      this.usersRepository.create({
        id,
        ...payload,
      }),
    );
  }

  editAccount(id: User['id'], payload: UpdateUserDto): Promise<User> {
    return this.usersRepository.save(
      this.usersRepository.create({
        id,
        ...payload,
      }),
    );
  }

  async checkEmailMemberExists(emailExistsDto: EmailExistsDto): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: {
        email: emailExistsDto.email,
      },
    });
  }

  async registerNotOtp(dto: AuthRegisterLoginDto): Promise<User> {
    return this.usersRepository.save(
      this.usersRepository.create({
        ...dto,
        email: dto.email,
        role: {
          id: RoleEnum.user,
        },
        status: {
          id: StatusEnum.inactive,
        },
      }),
    );
  }

  async updateStatusUser(userId: number, newStatus: StatusEnum) {
    await this.usersRepository.update(userId, { status: { id: newStatus } });
  }

  async softDelete(id: User['id']): Promise<void> {
    await this.usersRepository.softDelete(id);
  }
}
