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
import { Chat } from '../chats.model';

@Table
export class ChatUser extends Model<ChatUser> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  userId: string;

  @ForeignKey(() => Chat)
  @Column
  chatId: number;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Chat)
  chat: Chat;
}
