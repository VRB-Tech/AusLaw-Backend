import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { Invitation } from '../entities/Invitations';
import { InvitationService } from '../services/invitations.service';

@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Get('/:communityId')
  async getInvitationsForCommunity(
    @Param('communityId', ParseIntPipe) communityId: number,
  ): Promise<Invitation[]> {
    return this.invitationService.getInvitationsForCommunity(communityId);
  }

  @Get('invitee/:id')
  async getInvitationsForInvitee(
    @Param('id', ParseIntPipe) inviteeId: number,
  ): Promise<Invitation[]> {
    return this.invitationService.getInvitationsForInvitee(inviteeId);
  }

  @Patch('status/:id')
  async updateInvitationStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'accepted' | 'declined',
  ): Promise<Invitation> {
    if (status !== 'accepted' && status !== 'declined') {
      throw new HttpException('Invalid action', HttpStatus.BAD_REQUEST);
    }

    const invitation = await this.invitationService.updateInvitationStatus(
      id,
      status,
    );

    if (!invitation) {
      throw new HttpException('Invitation not found', HttpStatus.NOT_FOUND);
    }

    return invitation;
  }

  @Delete(':id')
  async deleteInvitation(@Param('id', ParseIntPipe) id: number) {
    return this.invitationService.deleteInvitation(id);
  }
}
