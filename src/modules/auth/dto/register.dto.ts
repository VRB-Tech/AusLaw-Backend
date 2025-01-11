import { IsBoolean, IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class BaseAuthDto {
  @IsBoolean({
    message: 'The "isDoyles" field must be a boolean value.',
  })
  @IsNotEmpty({
    message: 'The "isDoyles" field cannot be empty.',
  })
  isDoyles: boolean;

  @IsEmail(
    {},
    {
      message: 'The "email" field must be a valid email address.',
    },
  )
  @IsNotEmpty({
    message: 'The "email" field cannot be empty.',
  })
  email: string;

  @IsString({
    message: 'The "password" field must be a string.',
  })
  @IsNotEmpty({
    message: 'The "password" field cannot be empty.',
  })
  @MinLength(6, {
    message: 'The "password" field must be at least 6 characters long.',
  })
  password: string;
}

export class OrganisationRegisterDto extends BaseAuthDto {
  @IsString({
    message: 'The "name" field must be a string.',
  })
  @IsNotEmpty({
    message: 'The "name" field cannot be empty.',
  })
  name: string;
}

export class UserRegisterDto extends BaseAuthDto {
  @IsString({
    message: 'The "firstName" field must be a string.',
  })
  @IsNotEmpty({
    message: 'The "firstName" field cannot be empty.',
  })
  firstName: string;

  @IsString({
    message: 'The "lastName" field must be a string.',
  })
  @IsNotEmpty({
    message: 'The "lastName" field cannot be empty.',
  })
  lastName: string;
}
