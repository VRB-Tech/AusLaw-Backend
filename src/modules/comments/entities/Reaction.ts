import {
  Column,
  Model,
  Table,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  BelongsToMany,
} from 'sequelize-typescript';
import { User } from 'src/modules/users/users.model';
import { Comment } from './Comment';
import { ReactionUser } from './ReactionUser';

@Table
export class Reaction extends Model<Reaction> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Comment)
  @Column(DataType.INTEGER)
  commentId: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  reactorId: number;

  @Column(DataType.STRING)
  emoji: string;

  @Column({
    type: DataType.ARRAY(DataType.INTEGER),
    allowNull: false,
    defaultValue: [],
  })
  reactorIds: number[];

  @CreatedAt
  @Column(DataType.DATE)
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt: Date;

  @BelongsTo(() => Comment)
  comment: Comment;

  @BelongsToMany(() => User, () => ReactionUser)
  reactorsInfo: User[];
}
