import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from 'src/modules/users/users.model';
import { Post } from '../posts.model';

@Table
export class PostLikes extends Model<PostLikes> {
  @ForeignKey(() => Post)
  @Column
  postId: number;

  @ForeignKey(() => User)
  @Column
  userId: string;
}
