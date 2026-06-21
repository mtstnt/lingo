import { Column, Table, Unique } from 'sequelize-typescript';
import { BaseEntity } from '../../entities/base.entity';

@Table
export class User extends BaseEntity {
  @Unique
  @Column
  declare email: string;

  @Column
  declare password: string;

  @Column
  declare firstName: string;

  @Column
  declare lastName: string;

  @Column({ allowNull: true })
  declare refreshToken?: string;
}
