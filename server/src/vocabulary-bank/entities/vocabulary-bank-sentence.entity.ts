import { Column, Table } from 'sequelize-typescript';
import { BaseEntity } from '../../entities/base.entity';

@Table
export class VocabularyBankSentence extends BaseEntity {
  @Column
  declare vocabulary_id: number;

  @Column
  declare material_id: number;

  @Column
  declare sentence_index: number;
}
