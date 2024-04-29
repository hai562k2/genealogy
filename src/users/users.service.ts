import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { DeepPartial, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { NullableType } from '../utils/types/nullable.type';
import { CommonService } from 'src/utils/services/common.service';
import { EmailExistsDto } from 'src/auth/dto/email-exists.dto';
import { RoleEnum } from 'src/roles/roles.enum';
import { StatusEnum } from 'src/statuses/statuses.enum';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthRegisterNoOtpDto } from 'src/auth/dto/auth-register-no-otp.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { BaseResponseDto } from 'src/utils/dto/base-response.dto';
import { LisUserResponseType } from './type/list-user-response.type';

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

  async findManyWithPagination(paginationDto: FilterUserDto): Promise<BaseResponseDto<LisUserResponseType>> {
    const queryUser = await this.usersRepository.createQueryBuilder('user');

    if (paginationDto.keyword) {
      queryUser.where('LOWER(user.name) LIKE :keyword', {
        keyword: `%${paginationDto.keyword.toString().toLowerCase()}%`,
      });
    }

    if (paginationDto.id) {
      queryUser.andWhere('user.id = :id', {
        id: paginationDto.id,
      });
    }

    queryUser.leftJoinAndSelect('user.members', 'members').leftJoinAndSelect('members.clan', 'clan');
    if (paginationDto.clanId) {
      queryUser.andWhere('clan.id = :clanId', { clanId: paginationDto.clanId });
    }

    return this.commonService.getDataByPagination(paginationDto, queryUser);
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

  async registerNotOtp(dto: AuthRegisterNoOtpDto): Promise<User> {
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
