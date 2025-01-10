import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { FileUploader } from 'src/middlewares/FileUploader';
import { CloudinaryConfig } from 'src/uploads/cloudinary.config';
import { CommunitiesModule } from '../communities/communities.module';
import { PostsController } from './posts.controller';
import { Post } from './posts.model';
import { PostsService } from './posts.service';

@Module({
  imports: [SequelizeModule.forFeature([Post]), ConfigModule.forRoot(), CommunitiesModule],
  controllers: [PostsController],
  providers: [PostsService, CloudinaryConfig, FileUploader],
  exports: [PostsService],
})
export class PostsModule {}
