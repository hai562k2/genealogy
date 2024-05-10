import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { DeepPartial, Repository } from 'typeorm';
import { CreateMemberDto } from './dto/create-member.dto';
import { BaseResponseDto } from 'src/utils/dto/base-response.dto';
import { CreateMemberResponseType } from './types/create-member-response.type';
import { ResponseHelper } from 'src/utils/helpers/response.helper';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { ApiException } from 'src/utils/exceptions/api.exception';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';
import { Clan } from './entities/clan.entity';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  async create(createMemberDto: CreateMemberDto): Promise<BaseResponseDto<CreateMemberResponseType>> {
    const member = await this.memberRepository.save(this.memberRepository.create(createMemberDto));
    return ResponseHelper.success(member);
  }

  async findOne(fields: EntityCondition<Member>): Promise<BaseResponseDto<CreateMemberResponseType>> {
    const member = await this.memberRepository.findOne({
      where: fields,
      relations: ['members'],
    });

    if (!member) {
      throw new ApiException(
        {
          id: ErrorCodeEnum.MEMBER_NOT_FOUND,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          id: fields.id,
        },
      );
    }

    return ResponseHelper.success(member);
  }

  async update(id: Member['id'], payload: DeepPartial<Member>): Promise<BaseResponseDto<CreateMemberResponseType>> {
    const member = await this.memberRepository.save(
      this.memberRepository.create({
        id,
        ...payload,
      }),
    );

    return ResponseHelper.success(member);
  }

  async removeMember(clanId: Clan['id'], userId: number): Promise<void> {
    await this.memberRepository.softDelete({
      clanId: clanId,
      userId: userId,
    });
  }

  async delete(id: Clan['id'], memberId: Member['id']): Promise<void> {
    await this.memberRepository.delete({
      clanId: id,
      userId: memberId,
    });
  }

  async restoreMember(id: Clan['id'], memberId: Member['id']): Promise<void> {
    await this.memberRepository.restore({
      clanId: id,
      userId: memberId,
    });
  }

  async isEmailInClan(email: string, clanId: number) {
    return !!(await this.memberRepository.findOne({
      where: { members: { email }, clanId },
    }));
  }

  async isEmailInDeletedMembers(userId: number, clanId: number) {
    return await this.memberRepository
      .createQueryBuilder('member')
      .where('member.user_id = :userId', { userId })
      .andWhere('member.clanId = :clanId', { clanId: clanId })
      .withDeleted()
      .getOne();
  }
}
