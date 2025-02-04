import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { Op, WhereOptions } from 'sequelize';
import { FileUploader } from 'src/middlewares/FileUploader';
import { PaymentStatus } from 'src/types/PaymentStatus';
import { CreateUserDto } from './dto/create.dto';
import { UpdateUserDto } from './dto/update.dto';
import { User } from './users.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private readonly fileUploader: FileUploader,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({
      where: {
        email: createUserDto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException(`User with ID: '${id}' not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ where: { email } });
  }

  async findBySubscriptionId(subscriptionId: string): Promise<User> {
    return this.userModel.findOne({ where: { subscriptionId } });
  }

  async findByStripeCustomerId(customerStripeId: string): Promise<User> {
    return this.userModel.findOne({ where: { customerStripeId } });
  }

  async findByCheckoutSessionId(checkoutSessionId: string): Promise<User> {
    return this.userModel.findOne({ where: { checkoutSessionId } });
  }

  async getUsersByQuery(filters: {
    firstName?: string;
    lastName?: string;
    email?: string;
    state?: string;
    services?: string;
    dailyRate?: number;
  }): Promise<User[]> {
    const whereClause: WhereOptions = {};

    const filterMappings = {
      firstName: (value: string) => ({ [Op.like]: `%${value}%` }),
      lastName: (value: string) => ({ [Op.like]: `%${value}%` }),
      email: (value: string) => ({ [Op.like]: `%${value}%` }),
      state: (value: string) => ({ [Op.like]: `%${value}%` }),
      services: (value: string) => ({ [Op.contains]: [value] }),
      dailyRate: (value: number) => ({ [Op.eq]: value }),
    };

    Object.entries(filters).forEach(([key, value]) => {
      if (value && filterMappings[key]) {
        whereClause[key] = filterMappings[key](value);
      }
    });

    return this.userModel.findAll({
      where: whereClause,
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException(`User with ID: '${id}' not found`);
    }

    let uploadedFiles: string[] = [];

    if (updateUserDto.photo) {
      const filesToUpload = Array.isArray(updateUserDto.photo)
        ? updateUserDto.photo
        : [updateUserDto.photo];

      const validFilesToUpload = filesToUpload.filter(
        file => typeof file === 'string' || (file as Express.Multer.File).buffer,
      );

      uploadedFiles = await this.fileUploader.uploadFiles(validFilesToUpload);

      if (uploadedFiles.length > 0) {
        updateUserDto.photo = uploadedFiles[0];
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await this.updatePassword(user.id, updateUserDto.password);
    }

    return await user.update(updateUserDto);
  }

  async updatePaymentStatus(userId: string, paymentStatus: PaymentStatus): Promise<void> {
    await this.userModel.update({ paymentStatus }, { where: { id: userId } });
  }

  async updatePassword(userId: string, newPassword: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userModel.update({ password: hashedPassword }, { where: { id: userId } });

    return hashedPassword;
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException(`User with ID: '${id}' not found`);
    }

    await user.destroy();
    return { message: `User with ID ${id} was removed successfully.` };
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<string> {
    const hashedToken = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;
    await this.userModel.update({ refreshToken: hashedToken }, { where: { id: userId } });

    return refreshToken;
  }
}
