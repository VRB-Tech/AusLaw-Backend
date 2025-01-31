import {
  AutoIncrement,
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { User } from '../../users/users.model';
import { Community } from './Community';

@Table
export class CommunityUser extends Model<CommunityUser> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  userId: string;

  @ForeignKey(() => Community)
  @Column
  communityId: number;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Community)
  community: Community;
}
