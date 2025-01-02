import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';
import { Post } from '../posts.model';
import { User } from 'src/modules/users/users.model';

@Table
export class PostLikes extends Model<PostLikes> {
  @ForeignKey(() => Post)
  @Column
  postId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;
}
