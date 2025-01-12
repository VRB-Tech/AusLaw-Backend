import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import axios from 'axios';
import { Strategy } from 'passport-google-oauth20';
import { AuthService } from '../../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL:
        configService.get<string>('GOOGLE_CALLBACK_URL') ||
        'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile', 'openid'],
    });
  }

  async validate(googleToken: string): Promise<any> {
    const response = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
      headers: { Authorization: `Bearer ${googleToken}` },
    });

    if (response.status !== 200) {
      throw new InternalServerErrorException('Failed to fetch user profile from Google API');
    }

    const data = response.data;

    const profile = {
      id: data.id,
      email: data.email,
      givenName: data.given_name,
      familyName: data.family_name,
      picture: data.picture,
    };

    if (!profile.email || !profile.givenName || !profile.familyName) {
      throw new InternalServerErrorException('Incomplete profile information from Google');
    }

    const user = {
      email: profile.email,
      firstName: profile.givenName,
      lastName: profile.familyName,
      picture: profile.picture,
      accessToken: googleToken,
    };

    return await this.authService.registerUserByGoogle(user);
  }
}
