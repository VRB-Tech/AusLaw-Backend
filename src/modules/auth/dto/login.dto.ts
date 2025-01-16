import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class loginDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/\d/, { message: 'Password must contain at least one number' })
  password: string;

  @IsNotEmpty({ message: 'Type is required' })
  @IsString({ message: 'Type must be a string' })
  @Matches(/^(user|organisation)$/, { message: 'Type must be either "user" or "organisation"' })
  type: 'user' | 'individual' | 'organisation';
}
