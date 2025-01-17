import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { OrganisationResponseDto } from '../organisations/dto/organisationResponse.dto';
import { UserResponseDto } from '../users/dto/userResponse.dto';
import { AuthService } from './auth.service';
import { loginDto } from './dto/login.dto';
import { OrganisationRegisterDto, UserRegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './strategies/jwt/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    const user = req.user;

    const payload = { email: user.email, subject: user.id };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '14d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  @Post('register/user')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async registerUser(@Body() userRegisterDto: UserRegisterDto) {
    await this.authService.registerUser(userRegisterDto);

    return {
      message: 'Link successfully sent to your email.',
    };
  }

  @Post('register/confirm/user')
  async confirmUserRegistration(
    @Body('registrationToken') registerToken: string,
  ): Promise<UserResponseDto> {
    return this.authService.confirmUserRegistration(registerToken);
  }

  @Post('register/organisation')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async registerOrganisation(@Body() organisationRegisterDto: OrganisationRegisterDto) {
    await this.authService.registerOrganisation(organisationRegisterDto);

    return {
      message: 'Link successfully sent to your email.',
    };
  }

  @Post('register/confirm/organisation')
  async confirmOrganisationRegistration(
    @Body('registrationToken') registerToken: string,
  ): Promise<OrganisationResponseDto> {
    return this.authService.confirmOrganisationRegistration(registerToken);
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
