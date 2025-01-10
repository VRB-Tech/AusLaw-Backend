import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { FileUploader } from 'src/middlewares/FileUploader';
import { ChatsService } from 'src/modules/chats/chats.service';
import { User } from 'src/modules/users/users.model';
import { MessageStatusType } from 'src/types/MessageStatus';
import { CreateMessageDto } from './dto/create.dto';
import { UpdateMessageDto } from './dto/update.dto';
import { MessageStatus } from './entities/MessageStatus.model';
import { Message } from './messages.model';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message)
    private messageModel: typeof Message,
    @InjectModel(MessageStatus)
    private messageStatusModel: typeof MessageStatus,
    private readonly fileUploader: FileUploader,
    private readonly chatsService: ChatsService,
  ) {}

  async create(createMessageDto: CreateMessageDto) {
    const uploadedFiles = await this.fileUploader.uploadFiles(createMessageDto.files);

    const message = await this.messageModel.create({
      ...createMessageDto,
      files: uploadedFiles,
    });

    const participants = await this.chatsService.getChatParticipants(createMessageDto.chatId);

    await Promise.all(
      participants.map(async userId => {
        await this.messageStatusModel.create({
          userId,
          chatId: createMessageDto.chatId,
          messageId: message.id,
          isDelivered: userId === createMessageDto.senderId,
          isRead: false,
        });
      }),
    );

    return message;
  }

  async findAll(): Promise<Message[]> {
    return this.messageModel.findAll();
  }

  async findOne(id: number): Promise<Message> {
    const message = await this.messageModel.findByPk(id);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  async findAllByChatId(chatId: number): Promise<Message[]> {
    return this.messageModel.findAll({
      where: { chatId },
      include: [
        {
          model: User,
          attributes: ['username'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });
  }

  async update(id: number, updateMessageDto: UpdateMessageDto): Promise<Message> {
    const message = await this.findOne(id);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    await message.update(updateMessageDto, {
      fields: ['content', 'files', 'status'],
    });

    return message.reload();
  }

  async updateMessageStatus(messageId: number, userId: number, status: MessageStatusType) {
    const messageStatus = await this.messageStatusModel.findOne({
      where: { messageId, userId },
    });

    if (!messageStatus) {
      throw new NotFoundException('Message status not found');
    }

    if (status === 'delivered') {
      await messageStatus.update({ isDelivered: true });
    } else if (status === 'read') {
      await messageStatus.update({ isRead: true, readAt: new Date() });

      await this.messageModel.update({ status: 'read' }, { where: { id: messageId } });
    }

    return messageStatus.reload();
  }

  async checkIfSomeRead(messageId: number, participants: number[]): Promise<boolean> {
    const readCount = await this.messageStatusModel.count({
      where: { messageId, userId: { [Op.in]: participants }, isRead: true },
    });

    return readCount > 0;
  }

  async getUnreadCount(userId: number, chatId: number): Promise<number> {
    const unreadMessages = await this.messageStatusModel.count({
      where: { userId, chatId, isRead: false },
    });

    return unreadMessages;
  }

  async remove(id: number): Promise<Message> {
    const message = await this.findOne(id);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    await message.destroy();
    return message;
  }
}
