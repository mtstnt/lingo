import { Column, Table, DataType } from 'sequelize-typescript';
import { BaseEntity } from '../../entities/base.entity';

export type ResourceQueueStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'canceled'
  | 'failed';

@Table
export class ResourceQueue extends BaseEntity {
  @Column
  declare resource_id: number;

  @Column
  declare user_id: number;

  @Column(DataType.STRING)
  declare status: ResourceQueueStatus;

  @Column({ defaultValue: 0 })
  declare retry_count: number;

  @Column(DataType.DATE)
  declare last_processing_attempt_at: Date | null;

  @Column(DataType.TEXT)
  declare prompt: string;
}
