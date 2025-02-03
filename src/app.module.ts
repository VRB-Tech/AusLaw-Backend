import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { WebSocketModule } from './gateway/socket.module';
import { AuthModule } from './modules/auth/auth.module';
import { Chat } from './modules/chats/chats.model';
import { ChatsModule } from './modules/chats/chats.module';
import { ChatUser } from './modules/chats/entities/ChatUser.model';
import { CommentsModule } from './modules/comments/comments.module';
import { Comment } from './modules/comments/entities/Comment';
import { Reaction } from './modules/comments/entities/Reaction';
import { ReactionUser } from './modules/comments/entities/ReactionUser';
import { CommunitiesModule } from './modules/communities/communities.module';
import { Community } from './modules/communities/entities/Community';
import { CommunityUser } from './modules/communities/entities/CommunityUser';
import { Invitation } from './modules/communities/entities/Invitations';
import { MessageStatus } from './modules/messages/entities/MessageStatus.model';
import { Message } from './modules/messages/messages.model';
import { MessagesModule } from './modules/messages/messages.module';
import { Organisation } from './modules/organisations/entities/Organisation';
import { OrganisationsModule } from './modules/organisations/organisations.module';
import { PaymentModule } from './modules/payments/payment.module';
import { Post } from './modules/posts/posts.model';
import { PostsModule } from './modules/posts/posts.module';
import { User } from './modules/users/users.model';
import { UsersModule } from './modules/users/users.module';
import { NylasModule } from './nylas/nylas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        models: [
          Chat,
          User,
          Message,
          ChatUser,
          MessageStatus,
          Community,
          CommunityUser,
          Invitation,
          Reaction,
          ReactionUser,
          Comment,
          Post,
          Organisation,
        ],
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: true,
          },
        },
        autoLoadModels: true,
        synchronize: true,
      }),
    }),
    SequelizeModule.forFeature([
      ChatUser,
      User,
      Chat,
      Message,
      MessageStatus,
      Reaction,
      ReactionUser,
      Comment,
      Post,
      Organisation,
    ]),
    AuthModule,
    UsersModule,
    MessagesModule,
    ChatsModule,
    CommunitiesModule,
    PostsModule,
    CommentsModule,
    NylasModule,
    WebSocketModule,
    OrganisationsModule,
    PaymentModule,
  ],
})
export class AppModule {}
