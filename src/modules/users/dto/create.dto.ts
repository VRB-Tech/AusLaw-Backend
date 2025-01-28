import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from 'src/types/PaymentStatus';
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

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  photo?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  phone?: string;

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
  role: UserRole = 'user';

  @IsString()
  @IsOptional()
  bio?: string;

  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  hourlyRate: number;

  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  dailyRate?: number;

  @IsArray()
  services?: string[];

  @IsArray()
  specialisations?: string[];

  @IsArray()
  locations?: string[];

  @IsString()
  city?: string;

  @IsString()
  report?: string;

  @IsString()
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsString()
  @IsOptional()
  subscriptionId?: string;

  @IsString()
  @IsOptional()
  customerStripeId?: string;

  @IsString()
  @IsOptional()
  checkoutSessionId?: string;
}
