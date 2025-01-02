import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatGateway } from 'src/gateway/socket.gateway';
import { ChatsModule } from 'src/modules/chats/chats.module';
import { CommentsModule } from 'src/modules/comments/comments.module';
import { MessageStatus } from 'src/modules/messages/entities/MessageStatus.model';
import { Message } from 'src/modules/messages/messages.model';
import { MessagesModule } from 'src/modules/messages/messages.module';
import { PostsModule } from 'src/modules/posts/posts.module';

@Global()
@Module({
  imports: [
    SequelizeModule.forFeature([Message, MessageStatus]),
    ConfigModule.forRoot(),
    ChatsModule,
    PostsModule,
    CommentsModule,
    MessagesModule,
  ],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class WebSocketModule {}
