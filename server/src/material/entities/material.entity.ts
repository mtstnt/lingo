import { Column, Table, DataType } from 'sequelize-typescript';
import { BaseEntity } from '../../entities/base.entity';

@Table
export class Material extends BaseEntity {
  @Column
  declare resource_id: number;

  @Column
  declare user_id: number;

  @Column
  declare name: string;

  @Column(DataType.TEXT)
  declare vocabulary: string;

  @Column(DataType.TEXT)
  declare grammar: string;

  @Column(DataType.TEXT)
  declare quiz: string;
}
