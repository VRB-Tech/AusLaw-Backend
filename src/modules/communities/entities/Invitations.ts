import {
  Column,
  Model,
  Table,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { Community } from './Community';
import { User } from 'src/modules/users/users.model';
import { InviteStatus } from 'src/types/InviteStatus';

@Table
export class Invitation extends Model<Invitation> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Community)
  @Column(DataType.INTEGER)
  communityId: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  inviterId: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  inviteeId: number;

  @Column({
    type: DataType.ENUM('pending', 'accepted', 'declined'),
    defaultValue: 'pending',
  })
  status: InviteStatus;

  @BelongsTo(() => Community)
  community: Community;

  @BelongsTo(() => User, { foreignKey: 'inviterId' })
  inviter: User;

  @BelongsTo(() => User, { foreignKey: 'inviteeId' })
  invitee: User;
}
