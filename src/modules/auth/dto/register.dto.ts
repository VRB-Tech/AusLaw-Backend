import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class BaseAuthDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/\d/, { message: 'Password must contain at least one number' })
  password: string;
}

export class OrganisationRegisterDto extends BaseAuthDto {
  @IsString({
    message: 'The name field must be a string.',
  })
  @IsNotEmpty({
    message: 'The name field cannot be empty.',
  })
  name: string;
}

export class UserRegisterDto extends BaseAuthDto {
  @IsString({
    message: 'The firstName field must be a string.',
  })
  @IsNotEmpty({
    message: 'The firstName field cannot be empty.',
  })
  firstName: string;

  @IsString({
    message: 'The lastName field must be a string.',
  })
  @IsNotEmpty({
    message: 'The lastName field cannot be empty.',
  })
  lastName: string;
}
