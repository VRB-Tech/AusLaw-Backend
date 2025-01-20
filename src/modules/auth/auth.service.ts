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

    if (existingUser) {
      throw new ConflictException('User already exists');
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

      if (isDoyles) {
        const priceId = role === 'user' ? 'price_monthly' : 'price_annual';

        // const customer = await this.paymentService.createCustomer(email, 'pm_card_visa');
        // const subscription = await this.paymentService.createSubscription(customer.id, priceId);

        await this.usersService.updatePaymentStatus(newUser.id, 'pending', 'subscription.id');

        return {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          isDoyles: newUser.isDoyles,
          role: newUser.role,
          subscriptionId: 'subscription.id',
        };
      }

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

    const existingOrganisation = await this.organisationsService.findByEmail(email);

    if (existingOrganisation) {
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

      if (isDoyles) {
        const priceId = 'price_annual';

        // const customer = await this.paymentService.createCustomer(email, 'pm_card_visa');
        // const subscription = await this.paymentService.createSubscription(customer.id, priceId);

        await this.organisationsService.updatePaymentStatus(
          newOrganisation.id,
          'pending',
          'subscription.id',
        );

        return {
          id: newOrganisation.id,
          email: newOrganisation.email,
          name: newOrganisation.name,
          isDoyles: newOrganisation.isDoyles,
          subscriptionId: 'subscription.id',
        };
      }

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
      subject: account,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '14d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return {
      accessToken,
      refreshToken,
    };
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
        subject: user,
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
        subject: organisation,
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

    const resetLink = `https://auslaw-backend-dev.onrender.com/reset-password?token=${resetToken}`;

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
