import {
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Post } from '../../posts/posts.model';
import { User } from '../../users/users.model';
import { Reaction } from './Reaction';

@Table
export class Comment extends Model<Comment> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => User)
  @Column(DataType.STRING)
  creatorId: string;

  @ForeignKey(() => Post)
  @Column(DataType.INTEGER)
  postId: number;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  files?: string[];

  @Column(DataType.STRING)
  text: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt: Date;

  @BelongsTo(() => Post)
  post: Post;

  @BelongsTo(() => User)
  creator: User;

  @HasMany(() => Reaction)
  reactions: Reaction[];
}
