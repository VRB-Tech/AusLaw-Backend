import {
  Column,
  DataType,
  HasMany,
  IsUrl,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { User } from 'src/modules/users/users.model';
@Table
export class Organisation extends Model<Organisation> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column(DataType.STRING)
  refreshToken?: string;

  @IsUrl
  @Column({
    type: DataType.STRING,
    validate: {
      isUrl: true,
    },
  })
  photo: Express.Multer.File | string;

  @Column(DataType.STRING)
  officeAddress: string;

  @Column(DataType.STRING)
  phone: string;

  @Column(DataType.STRING)
  officeNumber: string;

  @Column(DataType.STRING)
  country: string;

  @Column(DataType.STRING)
  state: string;

  @Column(DataType.STRING)
  city: string;

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
  paymentStatus: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  subscriptionId: string;

  @Column(DataType.ARRAY(DataType.STRING))
  locations: string[];

  @Column(DataType.ARRAY(DataType.STRING))
  services: string[];

  @Column(DataType.ARRAY(DataType.STRING))
  specialisations: string[];

  @HasMany(() => User)
  members: User[];
}
