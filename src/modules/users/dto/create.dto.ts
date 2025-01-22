import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from 'src/types/UserRole';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  lastName: string;

  @IsString()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsBoolean()
  @IsNotEmpty({ message: 'Doyles status is required' })
  isDoyles: boolean;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  photo?: string;

  @IsString()
  @IsOptional()
  firebaseId?: string;

  @IsString()
  @IsOptional()
  grantId?: string;

  @IsString()
  @IsOptional()
  calendarEmail?: string;

  @IsString()
  @IsOptional()
  provider?: string;

  @IsString()
  @IsOptional()
  calendarId?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsEnum({ message: 'Role must be a valid UserRole' })
  role?: UserRole;

  @IsString()
  @IsOptional()
  paymentStatus?: string;

  @IsString()
  @IsOptional()
  subscriptionId?: string;

  @IsString()
  @IsOptional()
  customerStripeId?: string;
}
