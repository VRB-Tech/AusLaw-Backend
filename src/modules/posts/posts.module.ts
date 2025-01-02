import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryConfig } from 'uploads/cloudinary.config';
import { FileUploader } from 'src/middlewares/FileUploader';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post } from './posts.model';
import { CommunitiesModule } from '../communities/communities.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Post]),
    ConfigModule.forRoot(),
    CommunitiesModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, CloudinaryConfig, FileUploader],
  exports: [PostsService],
})
export class PostsModule {}
