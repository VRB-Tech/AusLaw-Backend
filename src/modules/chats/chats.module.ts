import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { Chat } from './chats.model';
import { User } from '../users/users.model';
import { Message } from '../messages/messages.model';
import { ChatUser } from 'src/modules/chats/entities/ChatUser.model';
import { FileUploader } from 'src/middlewares/FileUploader';
import { CloudinaryConfig } from 'uploads/cloudinary.config';
@Module({
  imports: [SequelizeModule.forFeature([Chat, User, Message, ChatUser])],
  providers: [ChatsService, CloudinaryConfig, FileUploader],
  controllers: [ChatsController],
  exports: [ChatsService],
})
export class ChatsModule {}
