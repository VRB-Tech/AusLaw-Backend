import {
  Column,
  Model,
  Table,
  PrimaryKey,
  AutoIncrement,
  DataType,
  HasMany,
  BelongsToMany,
} from 'sequelize-typescript';
import { CommunityUser } from './CommunityUser';
import { Invitation } from './Invitations';
import { User } from 'src/modules/users/users.model';

@Table
export class Community extends Model<Community> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  description?: string;

  @Column(DataType.STRING)
  image?: Express.Multer.File | string;

  @Column(DataType.STRING)
  banner?: Express.Multer.File | string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  creatorId: number;

  @Column(DataType.ARRAY(DataType.STRING))
  members: string[];

  @Column(DataType.ARRAY(DataType.STRING))
  admins: string[];

  @Column(DataType.DATE)
  createdAt: Date;

  @Column(DataType.DATE)
  updatedAt: Date;

  @HasMany(() => Invitation)
  invitations: Invitation[];

  @HasMany(() => CommunityUser)
  communityMembers: CommunityUser[];

  @BelongsToMany(() => User, () => CommunityUser)
  usersInfo: User[];
}
