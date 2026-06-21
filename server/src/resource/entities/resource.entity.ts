import { Column, Table, DataType } from 'sequelize-typescript';
import { BaseEntity } from '../../entities/base.entity';

export type ResourceType = 'text' | 'url' | 'image' | 'video';

@Table
export class Resource extends BaseEntity {
  @Column
  declare user_id: number;

  @Column
  declare name: string;

  @Column(DataType.STRING)
  declare type: ResourceType;

  @Column(DataType.TEXT)
  declare content: string;
}
