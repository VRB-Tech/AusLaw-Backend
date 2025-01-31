import { IsEmail, IsString } from 'class-validator';
import { UserRole } from 'src/types/UserRole';

export class UserResponseDto {
  @IsString()
  id: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  role: UserRole;
}
