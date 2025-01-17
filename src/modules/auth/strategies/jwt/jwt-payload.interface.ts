import { Organisation } from 'src/modules/organisations/entities/Organisation';
import { User } from 'src/modules/users/users.model';

export interface JwtPayload {
  email: string;
  subject: User | Organisation;
  role?: string;
}
