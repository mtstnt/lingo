import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import type { Job } from 'bull';
import { ResourceQueue } from './entities/resource-queue.entity';
import { ResourceQueueLog } from './entities/resource-queue-log.entity';
import { Material } from '../material/entities/material.entity';
import { Resource } from '../resource/entities/resource.entity';

const MAX_RETRIES = 3;

@Processor('resource-processing')
export class ResourceQueueProcessor {
  private readonly logger = new Logger(ResourceQueueProcessor.name);

  constructor(
    @InjectModel(ResourceQueue)
    private readonly resourceQueueModel: typeof ResourceQueue,
    @InjectModel(ResourceQueueLog)
    private readonly resourceQueueLogModel: typeof ResourceQueueLog,
    @InjectModel(Material)
    private readonly materialModel: typeof Material,
    @InjectModel(Resource)
    private readonly resourceModel: typeof Resource,
  ) {}

  @Process()
  async handleProcessing(job: Job<{ resourceQueueId: number }>) {
    const { resourceQueueId } = job.data;

    const queueEntry = await this.resourceQueueModel.findByPk(resourceQueueId);
    if (!queueEntry) {
      this.logger.warn(`Queue entry ${resourceQueueId} not found, skipping`);
      return;
    }

    if (queueEntry.status === 'canceled') {
      this.logger.log(`Queue entry ${resourceQueueId} is canceled, skipping`);
      return;
    }

    if (queueEntry.retry_count >= MAX_RETRIES) {
      this.logger.warn(
        `Queue entry ${resourceQueueId} exceeded max retries (${MAX_RETRIES}), skipping`,
      );
      return;
    }

    await queueEntry.update({
      status: 'processing',
      last_processing_attempt_at: new Date(),
    });

    const logEntry = await this.resourceQueueLogModel.create({
      resource_queue_id: resourceQueueId,
      start_at: new Date(),
      status: 'failed',
    });

    try {
      const resource = await this.resourceModel.findByPk(
        queueEntry.resource_id,
      );
      if (!resource) {
        throw new Error(`Resource ${queueEntry.resource_id} not found`);
      }

      const aiResponse = this.callAIPlaceholder(
        resource.content,
        queueEntry.prompt,
      );

      await this.materialModel.create({
        resource_id: queueEntry.resource_id,
        user_id: queueEntry.user_id,
        name: resource.name,
        vocabulary: JSON.stringify(aiResponse.vocabulary),
        grammar: JSON.stringify(aiResponse.grammar),
        quiz: JSON.stringify(aiResponse.quiz),
      });

      await queueEntry.update({ status: 'completed' });

      await logEntry.update({
        end_at: new Date(),
        status: 'completed',
        response: JSON.stringify(aiResponse),
      });

      this.logger.log(`Queue entry ${resourceQueueId} processed successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      await queueEntry.update({
        status: 'failed',
        retry_count: queueEntry.retry_count + 1,
      });

      await logEntry.update({
        end_at: new Date(),
        status: 'failed',
        status_info: errorMessage,
      });

      this.logger.error(
        `Queue entry ${resourceQueueId} failed: ${errorMessage}`,
      );

      throw error;
    }
  }

  private callAIPlaceholder(
    content: string,
    prompt: string,
  ): {
    vocabulary: Array<{
      sentence: string;
      words: Array<{ word: string; meaning: string; details: string }>;
    }>;
    grammar: Array<{
      sentence_index: number;
      structures: string[];
    }>;
    quiz: Array<{
      question: string;
      options: string[];
      correct_index: number;
    }>;
  } {
    // Placeholder for now...
    void content;
    void prompt;

    return {
      vocabulary: [
        {
          sentence: 'This is a placeholder sentence.',
          words: [
            {
              word: 'placeholder',
              meaning: 'temporary substitute',
              details: 'noun',
            },
          ],
        },
      ],
      grammar: [
        {
          sentence_index: 0,
          structures: ['Subject + Verb + Complement'],
        },
      ],
      quiz: [
        {
          question: 'What does "placeholder" mean?',
          options: [
            'A permanent item',
            'A temporary substitute',
            'A type of food',
            'A location',
          ],
          correct_index: 1,
        },
      ],
    };
  }
}
