import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create.dto';
import { UserResponseDto } from '../users/dto/userResponse.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/auth-dto';
import { JwtPayload } from './jwt/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, firstName, lastName, password } = createUserDto;
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const newUser = await this.usersService.create({
      firstName,
      lastName,
      email,
      password,
      role: 'user',
    });

    return {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
    };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string; user: UserResponseDto }> {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      email: user.email,
      subject: user.id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '60m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.usersService.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async refreshTokens(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = this.jwtService.verify(refreshToken);

      const user = await this.usersService.findById(decoded.subject);

      if (!user.refreshToken || !(await bcrypt.compare(refreshToken, user.refreshToken))) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const payload: JwtPayload = {
        email: user.email,
        subject: user.id,
        role: user.role,
      };

      const newAccessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
      const newRefreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      await this.usersService.updateRefreshToken(user.id, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: number): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }
}
