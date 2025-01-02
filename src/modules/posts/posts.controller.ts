import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create.dto';
import { UpdatePostDto } from './dto/update.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10))
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    createPostDto.files = files;
    return this.postsService.create(createPostDto);
  }

  @Post(':id/like')
  async likePost(@Param('id') id: number, @Body('userId') userId: number) {
    return this.postsService.likePost(id, userId);
  }

  @Get()
  async findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.postsService.findOne(id);
  }

  @Get('community/:communityId')
  async findAllByCommunityId(@Param('communityId') communityId: number) {
    return this.postsService.findAllByCommunityId(communityId);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updatePostDto: UpdatePostDto) {
    return await this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.postsService.remove(id);
  }

  @Delete(':id/unlike')
  async unlikePost(@Param('id') id: number, @Body('userId') userId: number) {
    return this.postsService.unlikePost(id, userId);
  }
}
