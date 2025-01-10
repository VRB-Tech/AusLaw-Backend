import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FileUploader } from 'src/middlewares/FileUploader';
import { ChatUser } from 'src/modules/chats/entities/ChatUser.model';
import { CloudinaryConfig } from 'src/uploads/cloudinary.config';
import { Message } from '../messages/messages.model';
import { User } from '../users/users.model';
import { ChatsController } from './chats.controller';
import { Chat } from './chats.model';
import { ChatsService } from './chats.service';
@Module({
  imports: [SequelizeModule.forFeature([Chat, User, Message, ChatUser])],
  providers: [ChatsService, CloudinaryConfig, FileUploader],
  controllers: [ChatsController],
  exports: [ChatsService],
})
export class ChatsModule {}
