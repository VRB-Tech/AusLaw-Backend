import { IsBoolean, IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateOrganisationDto {
  @IsNotEmpty({ message: 'The organisation name is required.' })
  @IsString({ message: 'The organisation name must be a string.' })
  @MaxLength(255, { message: 'The organisation name must not exceed 255 characters.' })
  name: string;

  @IsNotEmpty({ message: 'The email is required.' })
  @IsEmail({}, { message: 'The email must be a valid email address.' })
  @MaxLength(255, { message: 'The email must not exceed 255 characters.' })
  email: string;

  @IsNotEmpty({ message: 'The password is required.' })
  @MinLength(8, { message: 'The password must be at least 8 characters long.' })
  @MaxLength(128, { message: 'The password must not exceed 128 characters.' })
  password: string;

  @IsBoolean({ message: 'The isDoyles field must be a boolean.' })
  isDoyles: boolean;
}
