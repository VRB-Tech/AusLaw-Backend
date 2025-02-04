import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Matches,
  Min,
} from 'class-validator';
import { PaymentStatus } from 'src/types/PaymentStatus';
import { UserRole } from 'src/types/UserRole';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'First name is required' })
  @Matches(/^[a-zA-Z\s]+$/, { message: 'First name must only contain letters and spaces' })
  firstName?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Last name is required' })
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Last name must only contain letters and spaces' })
  lastName?: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsOptional()
  @IsNotEmpty({ message: 'Email is required' })
  email?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Password is required' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'Password must contain at least 8 characters, including letters, numbers, and special characters',
  })
  password?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Status must only contain letters and spaces' })
  status?: string;

  @IsString()
  @IsOptional()
  photo?: string | Express.Multer.File;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsPhoneNumber(null, { message: 'Phone number must be a valid phone number' })
  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsPhoneNumber(null, { message: 'Office mobile number must be a valid phone number' })
  officeNumber?: string;

  @IsUUID('4', { message: 'Firebase ID must be a valid UUID' })
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

  @IsOptional()
  @IsIn(['user'], { message: 'Role must be a valid UserRole' })
  role?: UserRole = 'user';

  @IsString()
  @IsOptional()
  bio?: string;

  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0, { message: 'Hourly rate must be a positive number' })
  hourlyRate?: number;

  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0, { message: 'Daily rate must be a positive number' })
  dailyRate?: number;

  @IsArray()
  @IsOptional()
  @IsString({ each: true, message: 'Services must be an array of strings' })
  services?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true, message: 'Specializations must be an array of strings' })
  specialisations?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true, message: 'Locations must be an array of strings' })
  locations?: string[];

  @IsString()
  @IsOptional()
  city?: string;

  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'Report must be a valid number' })
  report?: number;

  @IsOptional()
  @IsIn(['active', 'pending', 'canceled', 'free'], {
    message: 'Value must be a valid Payment Status',
  })
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

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
