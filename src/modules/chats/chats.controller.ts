import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create.dto';
import { UpdateChatDto } from './dto/update.dto';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('avatar', 1))
  async create(@Body() createChatDto: CreateChatDto, @UploadedFiles() avatar: Express.Multer.File) {
    createChatDto.avatar = avatar;

    return this.chatsService.create(createChatDto);
  }

  @Get()
  async findAll() {
    return this.chatsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.chatsService.findOne(id);
  }

  @Get('user/:userId')
  async findAllByUserId(@Param('userId') userId: number) {
    return this.chatsService.findAllByUserId(userId);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateChatDto: UpdateChatDto) {
    return this.chatsService.update(id, updateChatDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: number) {
    await this.chatsService.remove(id);
    return;
  }
}
