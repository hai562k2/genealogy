import { HttpStatus, Injectable } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';
import { InvitationMember } from './entities/invitation-member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiException } from 'src/utils/exceptions/api.exception';
import { ErrorCodeEnum } from 'src/utils/error-code.enum';
import { BaseResponseDto } from 'src/utils/dto/base-response.dto';
import { CreateInvitationMemberType } from './types/invitation-member.type';
import { ResponseHelper } from 'src/utils/helpers/response.helper';
import { EntityCondition } from 'src/utils/types/entity-condition.type';

Injectable();
export class InviteMemberService {
  constructor(
    @InjectRepository(InvitationMember)
    private inviteRepository: Repository<InvitationMember>,
  ) {}
  async create(InvitationMember: DeepPartial<InvitationMember>): Promise<BaseResponseDto<CreateInvitationMemberType>> {
    const invitationMember = await this.inviteRepository.save(this.inviteRepository.create(InvitationMember));
    return ResponseHelper.success(invitationMember);
  }

  async findOne(fields: EntityCondition<InvitationMember>): Promise<InvitationMember | null> {
    return await this.inviteRepository.findOne({
      where: fields,
    });
  }

  async delete(id: string): Promise<void> {
    const existingToken = await this.findOne({ id });

    if (!existingToken) {
      throw new ApiException(
        {
          message: ErrorCodeEnum.TOKEN_NOT_EXISTS,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    await this.inviteRepository.remove(existingToken);
  }
}
