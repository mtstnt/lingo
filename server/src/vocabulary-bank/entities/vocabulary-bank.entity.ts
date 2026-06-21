import { Column, Table, DataType } from 'sequelize-typescript';
import { BaseEntity } from '../../entities/base.entity';

@Table
export class VocabularyBank extends BaseEntity {
  @Column
  declare user_id: number;

  @Column
  declare original_word: string;

  @Column
  declare pronunciation: string;

  @Column(DataType.TEXT)
  declare meaning: string;
}
