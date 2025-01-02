import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
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
  userId: number;

  @ForeignKey(() => Community)
  @Column
  communityId: number;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Community)
  community: Community;
}
