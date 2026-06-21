import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BullModule } from '@nestjs/bull';
import { ResourceQueue } from './entities/resource-queue.entity';
import { ResourceQueueLog } from './entities/resource-queue-log.entity';
import { Resource } from '../resource/entities/resource.entity';
import { Material } from '../material/entities/material.entity';
import { ResourceQueueService } from './resource-queue.service';
import { ResourceQueueController } from './resource-queue.controller';
import { ResourceQueueProcessor } from './resource-queue.processor';
import { MaterialModule } from '../material/material.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ResourceQueue,
      ResourceQueueLog,
      Resource,
      Material,
    ]),
    BullModule.registerQueue({ name: 'resource-processing' }),
    forwardRef(() => MaterialModule),
  ],
  controllers: [ResourceQueueController],
  providers: [ResourceQueueService, ResourceQueueProcessor],
  exports: [ResourceQueueService],
})
export class ResourceQueueModule {}
