import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MailerService } from 'src/mailer/mail.service';
import { OrganisationResponseDto } from '../organisations/dto/organisationResponse.dto';
import { Organisation } from '../organisations/entities/Organisation';
import { OrganisationsService } from '../organisations/organisations.service';
import { UserResponseDto } from '../users/dto/userResponse.dto';
import { User } from '../users/users.model';
import { UsersService } from '../users/users.service';
import { loginDto } from './dto/login.dto';
import { authDto } from './dto/register.dto';
import { JwtPayload } from './jwt/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly organisationsService: OrganisationsService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async registerUser(authDto: authDto): Promise<UserResponseDto> {
    const { isDoyles, firstName, lastName, email, password } = authDto;
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const newUser = await this.usersService.create({
      firstName,
      lastName,
      email,
      password,
      isDoyles,
      role: 'user',
    });

    return {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
    };
  }

  async registerOrganisation(authDto: authDto): Promise<OrganisationResponseDto> {
    const { email, name, password, isDoyles } = authDto;

    const existingOrganisation = await this.organisationsService.findByEmail(email);

    if (existingOrganisation) {
      throw new ConflictException('Organisation already exists');
    }

    const newOrganisation = await this.organisationsService.create({
      isDoyles: isDoyles ?? false,
      name,
      email,
      password,
    });

    return {
      id: newOrganisation.id,
      email: newOrganisation.email,
      name: newOrganisation.name,
      isDoyles: newOrganisation.isDoyles,
    };
  }

  async login(
    loginDto: loginDto,
  ): Promise<
    | { accessToken: string; refreshToken: string; account: UserResponseDto }
    | { accessToken: string; refreshToken: string; account: OrganisationResponseDto }
  > {
    const { email, password, type } = loginDto;

    const account =
      type === 'user'
        ? await this.usersService.findByEmail(email)
        : await this.organisationsService.findByEmail(email);

    if (!account) {
      throw new UnauthorizedException('Account does not exist');
    }

    console.log(account);

    if (!(await bcrypt.compare(password, account.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      email: account.email,
      subject: account.id,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '14d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    if (type === 'user') {
      const user = account as User;
      await this.usersService.updateRefreshToken(user.id, refreshToken);

      return {
        accessToken,
        refreshToken,
        account: {
          id: user.id,
          isDoyles: user.isDoyles,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      };
    } else {
      const organisation = account as Organisation;
      await this.organisationsService.updateRefreshToken(organisation.id, refreshToken);

      return {
        accessToken,
        refreshToken,
        account: {
          id: organisation.id,
          email: organisation.email,
          name: organisation.name,
          isDoyles: organisation.isDoyles,
        },
      };
    }
  }

  async refreshTokenForUser(
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

      const newAccessToken = this.jwtService.sign(payload, { expiresIn: '14d' });
      const newRefreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

      await this.usersService.updateRefreshToken(user.id, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async refreshTokenForOrganisation(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = this.jwtService.verify(refreshToken);

      const organisation = await this.organisationsService.findById(decoded.subject);

      if (
        !organisation.refreshToken ||
        !(await bcrypt.compare(refreshToken, organisation.refreshToken))
      ) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const payload: JwtPayload = {
        email: organisation.email,
        subject: organisation.id,
      };

      const newAccessToken = this.jwtService.sign(payload, { expiresIn: '14d' });
      const newRefreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

      await this.organisationsService.updateRefreshToken(organisation.id, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async requestPasswordReset(email: string, type: 'user' | 'organisation'): Promise<void> {
    const account =
      type === 'user'
        ? await this.usersService.findByEmail(email)
        : await this.organisationsService.findByEmail(email);

    if (!account) {
      throw new NotFoundException('Account with this email does not exist.');
    }

    const resetToken = this.jwtService.sign(
      { email: account.email, subject: account.id },
      { expiresIn: '1h' },
    );

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    try {
      const decoded = this.jwtService.verify(resetToken);

      const { subject, email } = decoded;

      const user = await this.usersService.findById(subject);
      const organisation = await this.organisationsService.findById(subject);

      const account = user || organisation;

      if (!account || account.email !== email) {
        throw new UnauthorizedException('Invalid or expired reset token.');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user
        ? await this.usersService.updatePassword(user.id, hashedPassword)
        : await this.organisationsService.updatePassword(organisation.id, hashedPassword);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired reset token.');
    }
  }

  async logoutUser(userId: number): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async logoutOrganisation(organisationId: number): Promise<void> {
    await this.organisationsService.updateRefreshToken(organisationId, null);
  }
}
