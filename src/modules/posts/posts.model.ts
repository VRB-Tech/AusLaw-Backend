import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Comment } from '../comments/entities/Comment';
import { Community } from '../communities/entities/Community';
import { User } from '../users/users.model';

@Table
export class Post extends Model<Post> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Community)
  @Column(DataType.INTEGER)
  communityId: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  creatorId: string;

  @Column(DataType.TEXT)
  text: string;

  @Column({
    type: DataType.ARRAY(DataType.INTEGER),
    defaultValue: [],
  })
  likes: number[];

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  files: string[];

  @Column(DataType.DATE)
  createdAt: Date;

  @BelongsTo(() => Community, { onDelete: 'CASCADE' })
  community: Community;

  @BelongsTo(() => User)
  sender: User;

  @HasMany(() => Comment, {
    onDelete: 'CASCADE',
  })
  comments: Comment[];
}
