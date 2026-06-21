import { Column, Table } from 'sequelize-typescript';
import { BaseEntity } from '../../entities/base.entity';

@Table
export class VocabularyBankReference extends BaseEntity {
  @Column
  declare vocabulary_id: number;

  @Column
  declare referred_vocabulary_id: number;
}
