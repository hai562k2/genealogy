import { HttpStatus, Injectable } from '@nestjs/common';
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
import { getValueOrDefault } from 'src/utils';
import { ApiException } from 'src/utils/exceptions/api.exception';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';

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

  async getAllUser(clanId: number): Promise<User[]> {
    const users = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.members', 'members')
      .leftJoinAndSelect('members.clan', 'clan')
      .where('clan.id = :clanId', { clanId: clanId })
      .getMany();
    return users;
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
    const mid = getValueOrDefault(dto.motherId, 0);
    const fid = getValueOrDefault(dto.fatherId, 0);
    const mother = await this.findOne({ id: mid });
    const father = await this.findOne({ id: fid });
    const fatherName = getValueOrDefault(father?.name, 'No data');
    const motherName = getValueOrDefault(mother?.name, 'No data');

    return this.usersRepository.save(
      this.usersRepository.create({
        ...dto,
        fatherName: fatherName,
        motherName: motherName,
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
    const childFather = await this.findOne({ fatherId: id });
    const childMother = await this.findOne({ motherId: id });
    if (childFather != null || childMother != null) {
      throw new ApiException(
        {
          id: ErrorCodeEnum.NODE_PARENT,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          id: id,
        },
      );
    }
    await this.usersRepository.softDelete(id);
  }
}
