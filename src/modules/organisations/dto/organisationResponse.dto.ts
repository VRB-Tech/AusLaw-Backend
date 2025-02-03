import { IsEmail, IsString } from 'class-validator';

export class OrganisationResponseDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  paymentLink?: string;

  @IsString()
  subscriptionId?: string;
}
