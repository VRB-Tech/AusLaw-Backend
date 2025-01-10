import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FileUploader } from 'src/middlewares/FileUploader';
import { Message } from 'src/modules/messages/messages.model';
import { User } from 'src/modules/users/users.model';
import { CloudinaryConfig } from 'src/uploads/cloudinary.config';
import { UsersService } from '../users/users.service';
import { CommunityAdminController } from './controllers/administration.controller';
import { CommunityController } from './controllers/communities.controller';
import { InvitationController } from './controllers/invitation.controller';
import { Community } from './entities/Community';
import { CommunityUser } from './entities/CommunityUser';
import { Invitation } from './entities/Invitations';
import { CommunityAdminService } from './services/administration.service';
import { CommunityService } from './services/communities.service';
import { InvitationService } from './services/invitations.service';

@Module({
  imports: [SequelizeModule.forFeature([Community, User, Message, CommunityUser, Invitation])],
  providers: [
    CommunityService,
    CommunityAdminService,
    InvitationService,
    UsersService,
    CloudinaryConfig,
    FileUploader,
  ],
  controllers: [CommunityController, CommunityAdminController, InvitationController],
  exports: [CommunityService],
})
export class CommunitiesModule {}
