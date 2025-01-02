import {
  Column,
  Model,
  Table,
  PrimaryKey,
  AutoIncrement,
  DataType,
  HasMany,
  Default,
  BelongsToMany,
} from 'sequelize-typescript';
import { ChatUser } from 'src/modules/chats/entities/ChatUser.model';
import { ChatType } from 'src/types/ChatType';
import { User } from '../users/users.model';

@Table
export class Chat extends Model<Chat> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  creatorId: number;

  @Column(DataType.STRING)
  avatar?: string;

  @Column(DataType.STRING)
  chatName?: string;

  @Column(DataType.ARRAY(DataType.STRING))
  users: string[];

  @Default('private')
  @Column(DataType.STRING)
  type: ChatType;

  @Column(DataType.DATE)
  createdAt: Date;

  @Column(DataType.DATE)
  updatedAt: Date;

  @HasMany(() => ChatUser)
  chatUsers: ChatUser[];

  @BelongsToMany(() => User, () => ChatUser)
  usersInfo: User[];
}
