import {
  Column,
  Model,
  Table,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo,
  UpdatedAt,
  CreatedAt,
  HasMany,
} from 'sequelize-typescript';
import { User } from '../../users/users.model';
import { Post } from '../../posts/posts.model';
import { Reaction } from './Reaction';

@Table
export class Comment extends Model<Comment> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  creatorId: number;

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
