import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { FileUploader } from 'src/middlewares/FileUploader';
import { Message } from '../messages/messages.model';
import { User } from '../users/users.model';
import { Chat } from './chats.model';
import { CreateChatDto } from './dto/create.dto';
import { UpdateChatDto } from './dto/update.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Chat)
    private chatModel: typeof Chat,
    @InjectModel(Message)
    private messageModel: typeof Message,
    private readonly fileUploader: FileUploader,
    @InjectModel(User)
    private usersModel: typeof User,
  ) {}

  async create(createChatDto: CreateChatDto): Promise<Chat> {
    let uploadedFiles: string[] = [];

    if (createChatDto.avatar) {
      const filesToUpload = Array.isArray(createChatDto.avatar)
        ? createChatDto.avatar
        : [createChatDto.avatar];

      const validFilesToUpload = filesToUpload.filter(
        file => typeof file === 'string' || (file as Express.Multer.File).buffer,
      );

      uploadedFiles = await this.fileUploader.uploadFiles(validFilesToUpload);
    }

    const existingUsers = await this.usersModel.findAll({
      where: { id: createChatDto.users },
    });

    if (existingUsers.length !== createChatDto.users.length) {
      throw new Error('Some user IDs do not exist');
    }

    const chat = await this.chatModel.create({
      ...createChatDto,
      avatar: uploadedFiles[0],
    });

    await chat.$set(
      'usersInfo',
      existingUsers.map(user => user.id),
    );

    const chatWithUsers = await this.chatModel.findByPk(chat.id, {
      include: [
        {
          model: User,
          through: { attributes: [] },
        },
      ],
    });

    return chatWithUsers;
  }

  async getChatParticipants(chatId: number): Promise<number[]> {
    const chat = await this.findOne(chatId);

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat.users.map(id => Number(id));
  }

  async findAll(): Promise<Chat[]> {
    const chats = await this.chatModel.findAll({
      include: [{ model: User, through: { attributes: [] } }],
    });

    return chats;
  }

  async findOne(id: number): Promise<Chat> {
    const chat = await this.chatModel.findByPk(id, {
      include: [{ model: User, through: { attributes: [] } }],
    });

    if (!chat) throw new NotFoundException('Chat not found');

    return chat;
  }

  async findAllByUserId(userId: number): Promise<Chat[]> {
    const chats = await this.chatModel.findAll({
      where: {
        [Op.or]: [
          {
            users: {
              [Op.contains]: [userId],
            },
          },
          {
            type: 'public',
          },
        ],
      },
      include: [{ model: User, through: { attributes: [] } }],
    });

    return chats;
  }

  async update(id: number, updateChatDto: UpdateChatDto): Promise<Chat> {
    const chat = await this.findOne(id);

    return chat.update({
      ...updateChatDto,
      updatedAt: chat.updatedAt,
    });
  }

  async remove(id: number): Promise<Chat> {
    const chat = await this.findOne(id);

    await this.messageModel.destroy({
      where: { chatId: chat.id },
    });

    await chat.destroy();

    return chat;
  }
}
