import { UserRole } from 'src/types/UserRole';

export interface UserResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}
