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
import { Chat } from 'src/modules/chats/chats.model';
import { MessageStatusType } from 'src/types/MessageStatus';
import { User } from '../users/users.model';

@Table
export class Message extends Model<Message> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Chat)
  @Column(DataType.INTEGER)
  chatId: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    onDelete: 'CASCADE',
  })
  senderId: string;

  @Column(DataType.STRING)
  content: string;

  @Column({
    type: DataType.STRING,
    defaultValue: 'delivered',
  })
  status: MessageStatusType;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  files: string[];

  @Column(DataType.DATE)
  createdAt: Date;

  @BelongsTo(() => Chat)
  chat: Chat;

  @BelongsTo(() => User)
  sender: User;
}
