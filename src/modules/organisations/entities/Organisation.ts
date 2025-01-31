import { Column, DataType, Default, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
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

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isDoyles: boolean;

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
}
