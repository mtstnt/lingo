import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MaterialService } from './material.service';
import type { Material } from './entities/material.entity';

interface RequestWithUser extends Request {
  user: { id: number; email: string };
}

@ApiTags('Material')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('material')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Get()
  @ApiOperation({ summary: 'List all materials for the authenticated user' })
  findAll(@Request() req: RequestWithUser): Promise<Material[]> {
    return this.materialService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a material by ID' })
  findOne(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Material> {
    return this.materialService.findOne(id, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a material' })
  async remove(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.materialService.remove(id, req.user.id);
    return { message: 'Material deleted successfully' };
  }
}
