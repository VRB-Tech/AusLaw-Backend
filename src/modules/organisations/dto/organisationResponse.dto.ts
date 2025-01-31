import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class OrganisationResponseDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsBoolean()
  isDoyles: boolean;

  @IsString()
  paymentLink?: string;

  @IsString()
  subscriptionId?: string;
}
