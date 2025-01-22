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
import { OrganisationsService } from '../organisations/organisations.service';
import { UserResponseDto } from '../users/dto/userResponse.dto';
import { UsersService } from '../users/users.service';
import { loginDto } from './dto/login.dto';
import { OrganisationRegisterDto, UserRegisterDto } from './dto/register.dto';
import { JwtPayload } from './strategies/jwt/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly organisationsService: OrganisationsService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async registerUser(authDto: UserRegisterDto): Promise<void> {
    const { isDoyles, email, firstName, lastName, role, password } = authDto;

    if (role !== 'user' && role !== 'individual') {
      throw new UnauthorizedException('Invalid user role');
    }

    const existingUser = await this.usersService.findByEmail(email);
    const existingOrganisation = await this.organisationsService.findByEmail(email);

    if (existingUser || existingOrganisation) {
      throw new ConflictException('Account already exists');
    }

    const registrationToken = this.jwtService.sign(
      { isDoyles, email, firstName, lastName, role, password },
      { expiresIn: '1h' },
    );

    const redirectUrl = `http://localhost:3000/en/register/confirm?accountType=user&token=${registrationToken}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Complete Your Registration',
      html: `
        <p>Click the link below to complete your registration:</p>
        <a href="${redirectUrl}">Complete Registration</a>
      `,
    });
  }

  async confirmUserRegistration(registrationToken: string): Promise<UserResponseDto> {
    try {
      const decoded = this.jwtService.verify(registrationToken);

      const { isDoyles, email, firstName, lastName, password, role } = decoded;

      const existingUser = await this.usersService.findByEmail(email);

      if (existingUser) {
        throw new ConflictException('User already exists');
      }

      const newUser = await this.usersService.create({
        email,
        firstName,
        lastName,
        password,
        isDoyles,
        role,
      });

      return {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        isDoyles: newUser.isDoyles,
        role: newUser.role,
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired registration token');
    }
  }

  async registerOrganisation(authDto: OrganisationRegisterDto): Promise<void> {
    const { email, name, isDoyles, password } = authDto;

    const existingUser = await this.usersService.findByEmail(email);
    const existingOrganisation = await this.organisationsService.findByEmail(email);

    if (existingOrganisation || existingUser) {
      throw new ConflictException('Organisation already exists');
    }

    const registrationToken = this.jwtService.sign(
      { email, name, isDoyles, password },
      { expiresIn: '15m' },
    );

    const redirectUrl = `http://localhost:3000/en/register/confirm?accountType=organisation&token=${registrationToken}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Complete Your Organisation Registration',
      html: `
        <p>Click the link below to complete your organisation registration:</p>
        <a href="${redirectUrl}">Complete Registration</a>
      `,
    });
  }

  async confirmOrganisationRegistration(
    registrationToken: string,
  ): Promise<OrganisationResponseDto> {
    try {
      const decoded = this.jwtService.verify(registrationToken);

      const { isDoyles, email, name, password } = decoded;

      const existingOrganisation = await this.organisationsService.findByEmail(email);

      if (existingOrganisation) {
        throw new ConflictException('Organisation already exists');
      }

      const newOrganisation = await this.organisationsService.create({
        email,
        name,
        password,
        isDoyles,
      });

      return {
        id: newOrganisation.id,
        email: newOrganisation.email,
        name: newOrganisation.name,
        isDoyles: newOrganisation.isDoyles,
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired registration token');
    }
  }

  async login(
    loginDto: loginDto,
  ): Promise<
    { accessToken: string; refreshToken: string } | { accessToken: string; refreshToken: string }
  > {
    const { email, password } = loginDto;

    const account =
      (await this.usersService.findByEmail(email)) ||
      (await this.organisationsService.findByEmail(email));

    if (!account) {
      throw new UnauthorizedException('Account does not exist');
    }

    if (!(await bcrypt.compare(password, account.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      email: account.email,
      subject: account,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '14d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    'role' in account
      ? this.usersService.updateRefreshToken(account.id, refreshToken)
      : this.organisationsService.updateRefreshToken(account.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = this.jwtService.verify(refreshToken);

      const account =
        (await this.usersService.findByEmail(decoded.subject.email)) ||
        (await this.organisationsService.findByEmail(decoded.subject.email));

      if (!account.refreshToken || !(await bcrypt.compare(refreshToken, account.refreshToken))) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const payload: JwtPayload = {
        email: account.email,
        subject: account,
        role: 'role' in account ? account.role : 'organisation',
      };

      const newAccessToken = this.jwtService.sign(payload, { expiresIn: '14d' });
      const newRefreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

      if ('id' in account) {
        await (
          'role' in account ? this.usersService : this.organisationsService
        ).updateRefreshToken(account.id, newRefreshToken);
      }

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    const account =
      (await this.usersService.findByEmail(email)) ||
      (await this.organisationsService.findByEmail(email));

    if (!account) {
      throw new NotFoundException('Account with this email does not exist.');
    }

    const resetToken = this.jwtService.sign(
      { email: account.email, subject: account.id },
      { expiresIn: '1h' },
    );

    const resetLink = `http://localhost:3000/en/reset-password/confirm?token=${resetToken}`;

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

      user
        ? await this.usersService.updatePassword(account.id, newPassword)
        : await this.organisationsService.updatePassword(account.id, newPassword);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired reset token.');
    }
  }

  async logoutAccount(email: string): Promise<void> {
    const account =
      (await this.usersService.findByEmail(email)) ||
      (await this.organisationsService.findByEmail(email));

    await this.usersService.updateRefreshToken(account.id, null);
  }

  async registerUserByGoogle(profile: {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
    accessToken: string;
  }): Promise<UserResponseDto> {
    const existingUser = await this.usersService.findByEmail(profile.email);

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const newUser = await this.usersService.create({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      password: 'oauth',
      isDoyles: false,
      role: 'user',
    });

    return {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      isDoyles: newUser.isDoyles,
    };
  }
}
