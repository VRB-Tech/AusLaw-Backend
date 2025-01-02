import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  HasMany,
  BelongsToMany,
  DataType,
} from 'sequelize-typescript';
import { Chat } from '../chats/chats.model';
import { ChatUser } from 'src/modules/chats/entities/ChatUser.model';
import { UserRole } from 'src/types/UserRole';
import { Community } from '../communities/entities/Community';
import { CommunityUser } from '../communities/entities/CommunityUser';
import { Reaction } from '../comments/entities/Reaction';
import { ReactionUser } from '../comments/entities/ReactionUser';

@Table
export class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Column(DataType.STRING)
  username: string;

  @Column(DataType.STRING)
  password: string;

  @Column(DataType.STRING)
  photo: string;

  @Column(DataType.STRING)
  firebaseId: string;

  @Column(DataType.STRING)
  grantId: string;

  @Column(DataType.STRING)
  calendarEmail: string;

  @Column(DataType.STRING)
  provider: string;

  @Column(DataType.STRING)
  calendarId: string;

  @Column(DataType.STRING)
  timezone: string;

  @Column({
    type: DataType.STRING,
    defaultValue: 'offline',
  })
  status: string;

  @Column({
    type: DataType.STRING,
    defaultValue: 'user',
  })
  role: UserRole;

  @Column(DataType.STRING)
  streetAddress: string;

  @Column(DataType.STRING)
  accreditations: string;

  @Column(DataType.STRING)
  address: string;

  @Column(DataType.TEXT)
  bio: string;

  @Column(DataType.FLOAT)
  dailyRate: number;

  @Column(DataType.STRING)
  email: string;

  @Column(DataType.STRING)
  mobile: string;

  @Column(DataType.STRING)
  phone: string;

  @Column(DataType.STRING)
  planStatus: string;

  @Column(DataType.STRING)
  profileEmail: string;

  @Column(DataType.STRING)
  isDoyles: string;

  @Column(DataType.STRING)
  isOrganisation: string;

  @Column(DataType.ARRAY(DataType.STRING))
  services: string[];

  @Column(DataType.STRING)
  state: string;

  @Column(DataType.STRING)
  suburb: string;

  @HasMany(() => ChatUser)
  chatUsers: ChatUser[];

  @HasMany(() => CommunityUser)
  communityUsers: CommunityUser[];

  @BelongsToMany(() => Chat, () => ChatUser)
  chats: Chat[];

  @BelongsToMany(() => Community, () => CommunityUser)
  communities: Community[];

  @BelongsToMany(() => Reaction, () => ReactionUser)
  reactions: Reaction[];
}
