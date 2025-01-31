import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/modules/users/users.model';
import { InviteStatus } from 'src/types/InviteStatus';
import { Community } from '../entities/Community';
import { Invitation } from '../entities/Invitations';
import { CommunityService } from './communities.service';

@Injectable()
export class InvitationService {
  constructor(
    @InjectModel(Invitation)
    private readonly invitationModel: typeof Invitation,
    private readonly communityService: CommunityService,
  ) {}

  async getInvitationsForCommunity(communityId: number): Promise<Invitation[]> {
    return this.invitationModel.findAll({
      where: { communityId },
      include: [
        {
          model: User,
          as: 'invitee',
          attributes: [['username', 'inviteeName']],
        },
        {
          model: User,
          as: 'inviter',
          attributes: [['username', 'inviterName']],
        },
      ],
    });
  }

  async getInvitationsForInvitee(inviteeId: number): Promise<Invitation[]> {
    return this.invitationModel.findAll({
      where: { inviteeId, status: 'pending' },
      include: [
        {
          model: Community,
          as: 'community',
          attributes: [
            ['name', 'communityName'],
            ['image', 'communityPhoto'],
          ],
        },
        {
          model: User,
          as: 'invitee',
          attributes: [['username', 'inviteeName']],
        },
        {
          model: User,
          as: 'inviter',
          attributes: [['username', 'inviterName']],
        },
      ],
    });
  }

  async updateInvitationStatus(id: number, status: InviteStatus): Promise<Invitation | null> {
    const invitation = await this.invitationModel.findByPk(id);

    if (!invitation) {
      return null;
    }

    invitation.status = status;
    await invitation.save();

    if (status === 'accepted') {
      await this.communityService.addUserToCommunity(invitation.communityId, invitation.inviteeId);
    }

    return invitation;
  }

  async deleteInvitation(id: number): Promise<Invitation> {
    const invitation = await this.invitationModel.findByPk(id);

    if (!invitation) {
      throw new NotFoundException(`Invitation with ID ${id} not found`);
    }

    await invitation.destroy();

    return invitation;
  }
}
