import {
  Column,
  Model,
  Table,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { User } from '../users/users.model';
import { Chat } from 'src/modules/chats/chats.model';
import { MessageStatus } from './entities/MessageStatus.model';
import { MessageStatusType } from 'src/types/MessageStatus';

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
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
  })
  senderId: number;

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
