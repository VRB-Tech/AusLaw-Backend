import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/modules/users/users.model';
import { InviteStatus } from 'src/types/InviteStatus';
import { Community } from './Community';

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
  @Column(DataType.UUID)
  inviterId: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  inviteeId: string;

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
