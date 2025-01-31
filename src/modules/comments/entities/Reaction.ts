import {
  AutoIncrement,
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
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
  @Column(DataType.UUID)
  reactorId: string;

  @Column(DataType.STRING)
  emoji: string;

  @Column({
    type: DataType.ARRAY(DataType.INTEGER),
    allowNull: false,
    defaultValue: [],
  })
  reactorIds: string[];

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
