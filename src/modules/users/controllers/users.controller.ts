import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/modules/auth/strategies/jwt/jwt-auth.guard';
import { UpdateUserDto } from '../dto/update.dto';
import { CreateUserDto } from './../dto/create.dto';
import { User } from './../users.model';
import { UsersService } from './../users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('User already exists');
      }

      throw error;
    }
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.usersService.findById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User not found');
      }

      throw error;
    }
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('photo', 1))
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFiles() photo: Express.Multer.File[],
  ) {
    if (photo && photo.length > 0) {
      updateUserDto.photo = photo[0];
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.usersService.remove(id);
  }

  @Get('search')
  async findByQuery(
    @Query()
    filters: {
      firstName?: string;
      lastName?: string;
      email?: string;
      state?: string;
      services?: string;
      dailyRate?: number;
    },
  ): Promise<User[]> {
    return this.usersService.getUsersByQuery(filters);
  }
}
