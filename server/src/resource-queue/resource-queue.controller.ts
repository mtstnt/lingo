import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResourceQueueService } from './resource-queue.service';
import { CreateResourceQueueDto } from './dto/create-resource-queue.dto';
import type { ResourceQueue } from './entities/resource-queue.entity';

interface RequestWithUser extends Request {
  user: { id: number; email: string };
}

@ApiTags('Resource Queue')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('resource/queue')
export class ResourceQueueController {
  constructor(private readonly resourceQueueService: ResourceQueueService) {}

  @Get()
  @ApiOperation({ summary: 'List current user queued resources' })
  findAll(@Request() req: RequestWithUser): Promise<ResourceQueue[]> {
    return this.resourceQueueService.findAll(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Push a new resource for queue processing' })
  create(
    @Request() req: RequestWithUser,
    @Body() dto: CreateResourceQueueDto,
  ): Promise<ResourceQueue> {
    return this.resourceQueueService.create(req.user.id, dto);
  }

  @Delete(':resource_queue_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a queued resource' })
  async cancel(
    @Request() req: RequestWithUser,
    @Param('resource_queue_id', ParseIntPipe) resourceQueueId: number,
  ): Promise<ResourceQueue> {
    return this.resourceQueueService.cancel(req.user.id, resourceQueueId);
  }
}
