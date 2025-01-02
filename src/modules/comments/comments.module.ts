import { Module } from '@nestjs/common';
import { CommentsService } from './services/comments.service';
import { CommentsController } from './controllers/comments.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Post } from '../posts/posts.model';
import { User } from '../users/users.model';
import { Comment } from './entities/Comment';
import { ReactionsService } from './services/reactions.service';
import { ReactionsController } from './controllers/reactions.controller';
import { Reaction } from './entities/Reaction';
import { ReactionUser } from './entities/ReactionUser';

@Module({
  imports: [
    SequelizeModule.forFeature([Comment, User, Post, Reaction, ReactionUser]),
  ],
  controllers: [CommentsController, ReactionsController],
  providers: [CommentsService, ReactionsService],
  exports: [CommentsService, ReactionsService],
})
export class CommentsModule {}
