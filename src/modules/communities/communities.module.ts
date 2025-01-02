import { Module } from '@nestjs/common';
import { CommunityService } from './services/communities.service';
import { CommunityController } from './controllers/communities.controller';
import { User } from 'src/modules/users/users.model';
import { Message } from 'src/modules/messages/messages.model';
import { CommunityUser } from './entities/CommunityUser';
import { Community } from './entities/Community';
import { SequelizeModule } from '@nestjs/sequelize';
import { CloudinaryConfig } from 'uploads/cloudinary.config';
import { FileUploader } from 'src/middlewares/FileUploader';
import { Invitation } from './entities/Invitations';
import { CommunityAdminController } from './controllers/administration.controller';
import { CommunityAdminService } from './services/administration.service';
import { InvitationController } from './controllers/invitation.controller';
import { InvitationService } from './services/invitations.service';
import { UsersService } from '../users/users.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Community,
      User,
      Message,
      CommunityUser,
      Invitation,
    ]),
  ],
  providers: [
    CommunityService,
    CommunityAdminService,
    InvitationService,
    UsersService,
    CloudinaryConfig,
    FileUploader,
  ],
  controllers: [
    CommunityController,
    CommunityAdminController,
    InvitationController,
  ],
  exports: [CommunityService],
})
export class CommunitiesModule {}
