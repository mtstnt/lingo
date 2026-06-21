import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResourceService } from './resource.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import type { Resource } from './entities/resource.entity';

interface RequestWithUser extends Request {
  user: { id: number; email: string };
}

@ApiTags('Resource')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new resource' })
  create(
    @Request() req: RequestWithUser,
    @Body() dto: CreateResourceDto,
  ): Promise<Resource> {
    return this.resourceService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all resources for the authenticated user' })
  findAll(@Request() req: RequestWithUser): Promise<Resource[]> {
    return this.resourceService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a resource by ID' })
  findOne(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Resource> {
    return this.resourceService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a resource' })
  update(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateResourceDto,
  ): Promise<Resource> {
    return this.resourceService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a resource' })
  async remove(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.resourceService.remove(id, req.user.id);
    return { message: 'Resource deleted successfully' };
  }
}
