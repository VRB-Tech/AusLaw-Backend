import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class authDto {
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsBoolean()
  @IsNotEmpty()
  isDoyles: boolean;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
