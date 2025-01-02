import {
  Column,
  Model,
  Table,
  ForeignKey,
  PrimaryKey,
  DataType,
} from 'sequelize-typescript';
import { User } from 'src/modules/users/users.model';
import { Reaction } from './Reaction';

@Table
export class ReactionUser extends Model<ReactionUser> {
  @PrimaryKey
  @ForeignKey(() => Reaction)
  @Column(DataType.INTEGER)
  reactionId: number;

  @PrimaryKey
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId: number;

  @Column(DataType.STRING)
  emoji: string;
}
