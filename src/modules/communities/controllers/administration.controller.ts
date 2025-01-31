import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { User } from 'src/modules/users/users.model';
import { Community } from '../entities/Community';
import { Invitation } from '../entities/Invitations';
import { CommunityAdminService } from '../services/administration.service';

@Controller('community-admin')
export class CommunityAdminController {
  constructor(private readonly communityAdminService: CommunityAdminService) {}

  @Post('invite')
  async inviteUsers(
    @Body('communityId', ParseIntPipe) communityId: number,
    @Body('inviterId', ParseIntPipe) inviterId: string,
    @Body('inviteeIds') inviteeIds: string[],
  ): Promise<Invitation[]> {
    return this.communityAdminService.inviteUsersToCommunity(communityId, inviterId, inviteeIds);
  }

  @Get('admins')
  async getAllAdmins(): Promise<User[]> {
    return this.communityAdminService.getAllAdmins();
  }

  @Patch('users/:userId/role')
  async updateUserRole(
    @Param('userId') userId: number,
    @Body('communityId') communityId: number,
    @Body('role') role: 'admin' | 'user',
  ): Promise<Community> {
    return this.communityAdminService.updateUserCommunityRole(communityId, userId, role);
  }

  @Delete('users/:userId')
  async removeUserFromCommunity(
    @Param('userId') userId: number,
    @Body('communityId') communityId: number,
  ): Promise<{ message: string }> {
    return this.communityAdminService.removeUserFromCommunity(communityId, userId);
  }
}
