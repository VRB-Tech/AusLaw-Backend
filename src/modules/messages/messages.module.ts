import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Message } from './messages.model';
import { MessageStatus } from './entities/MessageStatus.model';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryConfig } from 'uploads/cloudinary.config';
import { ChatsModule } from 'src/modules/chats/chats.module';
import { FileUploader } from 'src/middlewares/FileUploader';
import { PostsModule } from '../posts/posts.module';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Message, MessageStatus]),
    ConfigModule.forRoot(),
    ChatsModule,
    PostsModule,
    CommentsModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService, CloudinaryConfig, FileUploader],
  exports: [MessagesService],
})
export class MessagesModule {}
