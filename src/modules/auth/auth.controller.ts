import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDto } from './dto/login.dto';
import { authDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerAccountDto: authDto) {
    const type = registerAccountDto.name ? 'organisation' : 'user';
    const response =
      type === 'organisation'
        ? await this.authService.registerOrganisation(registerAccountDto)
        : await this.authService.registerUser(registerAccountDto);

    return {
      message: `${type === 'user' ? 'User' : 'Organisation'} registered successfully`,
      account: response,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: loginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body('refreshToken') refreshToken: string,
    @Body('type') type: 'user' | 'organisation',
  ) {
    if (!type || !['user', 'organisation'].includes(type)) {
      throw new BadRequestException('Invalid or missing account type');
    }

    return type === 'user'
      ? this.authService.refreshTokenForUser(refreshToken)
      : this.authService.refreshTokenForOrganisation(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@Body('id') id: number, @Body('type') type: 'user' | 'organisation') {
    if (!type || !['user', 'organisation'].includes(type)) {
      throw new BadRequestException('Invalid or missing account type');
    }

    type === 'user'
      ? await this.authService.logoutUser(id)
      : await this.authService.logoutOrganisation(id);

    return { message: `${type === 'user' ? 'User' : 'Organisation'} logged out successfully` };
  }

  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() { email, type }: { email: string; type: 'user' | 'organisation' },
  ) {
    await this.authService.requestPasswordReset(email, type);
    return { message: 'Password reset link sent successfully' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Query('token') token: string, @Body('newPassword') newPassword: string) {
    await this.authService.resetPassword(token, newPassword);
    return { message: 'Password has been reset successfully' };
  }
}
