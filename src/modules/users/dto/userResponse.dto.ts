import { IsBoolean, IsEmail, IsNumber, IsString } from 'class-validator';
import { UserRole } from 'src/types/UserRole';

export class UserResponseDto {
  @IsNumber()
  id: number;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  role: UserRole;

  @IsBoolean()
  isDoyles: boolean;

  @IsString()
  paymentLink?: string;

  @IsString()
  subscriptionId?: string;
}
