import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { FileUploader } from 'src/middlewares/FileUploader';
import { ChatsModule } from 'src/modules/chats/chats.module';
import { CloudinaryConfig } from 'src/uploads/cloudinary.config';
import { CommentsModule } from '../comments/comments.module';
import { PostsModule } from '../posts/posts.module';
import { MessageStatus } from './entities/MessageStatus.model';
import { MessagesController } from './messages.controller';
import { Message } from './messages.model';
import { MessagesService } from './messages.service';

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
