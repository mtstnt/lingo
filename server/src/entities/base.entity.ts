import {
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Table,
} from 'sequelize-typescript';

@Table
export abstract class BaseEntity extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt?: Date;
}
