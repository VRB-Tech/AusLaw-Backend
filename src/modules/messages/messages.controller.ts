import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MessageStatusType } from 'src/types/MessageStatus';
import { CreateMessageDto } from './dto/create.dto';
import { UpdateMessageDto } from './dto/update.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10))
  async create(
    @Body() createMessageDto: CreateMessageDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    createMessageDto.files = files;

    return this.messagesService.create(createMessageDto);
  }

  @Get()
  async findAll() {
    return this.messagesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.messagesService.findOne(id);
  }

  @Get('chat/:chatId')
  async findAllByChatId(@Param('chatId') chatId: number) {
    return this.messagesService.findAllByChatId(chatId);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateMessageDto: UpdateMessageDto) {
    return await this.messagesService.update(id, updateMessageDto);
  }

  @Patch(':messageId/status/:userId')
  async updateStatus(
    @Param('messageId') messageId: number,
    @Param('userId') userId: number,
    @Body('status') status: MessageStatusType,
  ) {
    return await this.messagesService.updateMessageStatus(messageId, userId, status);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    const deletedMessage = await this.messagesService.remove(id);
    return deletedMessage;
  }
}
