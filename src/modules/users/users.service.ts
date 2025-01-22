import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { Op, WhereOptions } from 'sequelize';
import { CreateUserDto } from './dto/create.dto';
import { User } from './users.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
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

  async findById(userId: number): Promise<User | null> {
    return this.userModel.findOne({ where: { id: userId } });
  }

  async findOne(id: string): Promise<User> {
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

  async update(id: string, updateUserDto: Partial<CreateUserDto>): Promise<User> {
    const user = await this.userModel.findByPk(id);

    if (updateUserDto.password) {
      updateUserDto.password = await this.updatePassword(user.id, updateUserDto.password);
    }

    return user.update(updateUserDto);
  }

  async updatePaymentStatus(userId: number, paymentStatus: string): Promise<void> {
    await this.userModel.update({ paymentStatus }, { where: { id: userId } });
  }

  async updatePassword(userId: number, newPassword: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userModel.update({ password: hashedPassword }, { where: { id: userId } });

    return hashedPassword;
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID: '${id}' not found`);
    }

    await user.destroy();
    return { message: `User with ID ${id} was removed successfully.` };
  }

  async updateRefreshToken(userId: number, refreshToken: string | null): Promise<string> {
    const hashedToken = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;
    await this.userModel.update({ refreshToken: hashedToken }, { where: { id: userId } });

    return refreshToken;
  }
}
