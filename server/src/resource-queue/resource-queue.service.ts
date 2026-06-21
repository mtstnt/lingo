import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ResourceQueue } from './entities/resource-queue.entity';
import { ResourceQueueLog } from './entities/resource-queue-log.entity';
import { Resource } from '../resource/entities/resource.entity';
import { CreateResourceQueueDto } from './dto/create-resource-queue.dto';

const DEFAULT_PROMPT =
  'Extract vocabulary (words, meanings, details), grammar structures, and generate comprehension quiz questions from the provided content.';

@Injectable()
export class ResourceQueueService {
  constructor(
    @InjectModel(ResourceQueue)
    private readonly resourceQueueModel: typeof ResourceQueue,
    @InjectModel(ResourceQueueLog)
    private readonly resourceQueueLogModel: typeof ResourceQueueLog,
    @InjectModel(Resource)
    private readonly resourceModel: typeof Resource,
    @InjectQueue('resource-processing')
    private readonly processingQueue: Queue,
  ) {}

  async findAll(userId: number): Promise<ResourceQueue[]> {
    return this.resourceQueueModel.findAll({
      where: { user_id: userId },
      attributes: { exclude: ['prompt'] },
    });
  }

  async create(
    userId: number,
    dto: CreateResourceQueueDto,
  ): Promise<ResourceQueue> {
    const resource = await this.resourceModel.findOne({
      where: { id: dto.resource_id, user_id: userId },
    });
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    const queueEntry = await this.resourceQueueModel.create({
      resource_id: dto.resource_id,
      user_id: userId,
      status: 'pending',
      prompt: DEFAULT_PROMPT,
    });

    await this.processingQueue.add({
      resourceQueueId: queueEntry.id,
    });

    return queueEntry;
  }

  async cancel(
    userId: number,
    resourceQueueId: number,
  ): Promise<ResourceQueue> {
    const queueEntry = await this.resourceQueueModel.findOne({
      where: { id: resourceQueueId, user_id: userId },
    });
    if (!queueEntry) {
      throw new NotFoundException('Resource queue entry not found');
    }

    await queueEntry.update({ status: 'canceled' });

    await this.resourceQueueLogModel.update(
      { status: 'canceled', end_at: new Date() },
      {
        where: {
          resource_queue_id: resourceQueueId,
          end_at: null,
        },
      },
    );

    return queueEntry;
  }

  async findOne(id: number, userId: number): Promise<ResourceQueue> {
    const queueEntry = await this.resourceQueueModel.findOne({
      where: { id, user_id: userId },
    });
    if (!queueEntry) {
      throw new NotFoundException('Resource queue entry not found');
    }
    return queueEntry;
  }
}
