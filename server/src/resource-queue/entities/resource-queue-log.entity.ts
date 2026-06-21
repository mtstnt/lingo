import { Column, Table, DataType } from 'sequelize-typescript';
import { BaseEntity } from '../../entities/base.entity';

export type ResourceQueueLogStatus = 'completed' | 'canceled' | 'failed';

@Table
export class ResourceQueueLog extends BaseEntity {
  @Column
  declare resource_queue_id: number;

  @Column(DataType.DATE)
  declare start_at: Date;

  @Column(DataType.DATE)
  declare end_at: Date | null;

  @Column(DataType.STRING)
  declare status: ResourceQueueLogStatus;

  @Column(DataType.TEXT)
  declare status_info: string | null;

  @Column(DataType.TEXT)
  declare response: string | null;
}
