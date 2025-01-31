import { IsNotEmpty } from 'class-validator';
import {
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { ChatUser } from 'src/modules/chats/entities/ChatUser.model';
import { PaymentStatus } from 'src/types/PaymentStatus';
import { UserRole } from 'src/types/UserRole';
import { Chat } from '../chats/chats.model';
import { Reaction } from '../comments/entities/Reaction';
import { ReactionUser } from '../comments/entities/ReactionUser';
import { Community } from '../communities/entities/Community';
import { CommunityUser } from '../communities/entities/CommunityUser';
@Table
export class User extends Model<User> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  lastName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      isEmail: true,
    },
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [8, 100],
    },
  })
  password: string;

  @Column({
    type: DataType.STRING,
    validate: {
      isUrl: true,
    },
  })
  photo: Express.Multer.File | string;

  @Column({
    type: DataType.STRING,
  })
  phone: string;

  @Column({
    type: DataType.STRING,
  })
  officeNumber: string;

  @Column({
    type: DataType.STRING,
  })
  country: string;

  @Column({
    type: DataType.STRING,
  })
  state: string;

  @Column(DataType.STRING)
  refreshToken: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  checkoutSessionId: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  customerStripeId: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  subscriptionId: string;

  @Column(DataType.STRING)
  grantId: string;

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
  })
  @IsNotEmpty({ message: 'Role is required' })
  role: UserRole;

  @Column(DataType.TEXT)
  bio: string;

  @Column(DataType.TEXT)
  report: string;

  @Column(DataType.FLOAT)
  hourlyRate: number;

  @Column(DataType.FLOAT)
  dailyRate: number;

  @Column(DataType.ARRAY(DataType.STRING))
  services: string[];

  @Column(DataType.ARRAY(DataType.STRING))
  locations: string[];

  @Column(DataType.STRING)
  city: string;

  @Column(DataType.ARRAY(DataType.STRING))
  specialisations: string[];

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
