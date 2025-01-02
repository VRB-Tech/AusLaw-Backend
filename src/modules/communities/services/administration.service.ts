import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Invitation } from '../entities/Invitations';
import { User } from 'src/modules/users/users.model';
import { Community } from '../entities/Community';
import { UsersService } from 'src/modules/users/users.service';
import { CommunityUser } from '../entities/CommunityUser';
import { Op } from 'sequelize';

@Injectable()
export class CommunityAdminService {
  constructor(
    @InjectModel(Community)
    private readonly communityModel: typeof Community,
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(Invitation)
    private readonly invitationModel: typeof Invitation,
    private readonly userService: UsersService,
  ) {}

  async inviteUsersToCommunity(
    communityId: number,
    inviterId: number,
    inviteeIds: number[],
  ): Promise<Invitation[]> {
    const community = await this.communityModel.findByPk(communityId);

    if (!community) {
      throw new NotFoundException(`Community with ID ${communityId} not found`);
    }

    if (inviteeIds.includes(inviterId)) {
      throw new ForbiddenException(`Admins cannot invite themselves`);
    }

    const owners = await this.userModel.findAll({
      where: {
        role: {
          [Op.or]: ['admin', 'owner'],
        },
      },
    });

    if (
      !Array.isArray(community.admins) ||
      (!community.admins.includes(inviterId.toString()) &&
        !owners.some((owner) => owner.id === inviterId))
    ) {
      throw new ForbiddenException(
        `Only community admins can send invitations`,
      );
    }

    const invitations: Invitation[] = [];

    for (const inviteeId of inviteeIds) {
      const existingInvitation = await this.invitationModel.findOne({
        where: {
          communityId,
          inviteeId,
          status: 'pending',
        },
      });

      if (existingInvitation) {
        throw new ConflictException(
          `An invitation already exists for user ID ${inviteeId} in community ID ${communityId}`,
        );
      }

      const invitation = await this.invitationModel.create({
        communityId,
        inviterId,
        inviteeId,
        status: 'pending',
      });
      invitations.push(invitation);
    }

    return invitations;
  }

  async getAllAdmins(): Promise<User[]> {
    return this.userModel.findAll({
      where: {
        role: {
          [Op.or]: ['admin', 'owner'],
        },
      },
    });
  }

  async updateUserCommunityRole(
    communityId: number,
    userId: number,
    role: 'user' | 'admin',
  ): Promise<Community> {
    const community = await this.communityModel.findByPk(communityId);

    if (!community) {
      throw new NotFoundException(`Community with ID ${communityId} not found`);
    }

    const userIdStr = userId.toString();

    let members = [...community.members];
    let admins = [...community.admins];

    if (role === 'admin') {
      if (members.includes(userIdStr) && !admins.includes(userIdStr)) {
        admins.push(userIdStr);
      }
    } else {
      admins = admins.filter((adminId) => adminId !== userIdStr);
    }

    await community.update({
      admins: admins,
      members: members,
    });

    return community;
  }

  async removeUserFromCommunity(
    communityId: number,
    userId: number,
  ): Promise<{ message: string }> {
    const community = await this.communityModel.findByPk(communityId, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'role', 'photo'],
        },
        {
          model: CommunityUser,
          attributes: ['id', 'userId', 'communityId'],
        },
      ],
    });

    if (!community) {
      throw new NotFoundException(`Community with ID ${communityId} not found`);
    }

    if (
      !community.members.some(
        (memberId) => memberId.toString() === userId.toString(),
      ) &&
      !community.admins.some(
        (adminId) => adminId.toString() === userId.toString(),
      )
    ) {
      throw new NotFoundException(
        `User with ID ${userId} not found in community ${communityId}`,
      );
    }

    const members = community.members.filter(
      (memberId) => memberId !== userId.toString(),
    );

    const admins = community.admins.filter(
      (adminId) => adminId !== userId.toString(),
    );

    const communityUser = await CommunityUser.findOne({
      where: {
        userId: userId,
        communityId: communityId,
      },
    });

    if (communityUser) {
      await communityUser.destroy();
    }

    await community.update({
      admins: admins,
      members: members,
    });

    return {
      message: `User with ID ${userId} has been removed from community ${communityId}`,
    };
  }
}
