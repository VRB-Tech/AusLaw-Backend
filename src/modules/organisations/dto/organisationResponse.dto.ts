import { IsBoolean, IsEmail, IsNumber, IsString } from 'class-validator';

export class OrganisationResponseDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsBoolean()
  isDoyles: boolean;
}
