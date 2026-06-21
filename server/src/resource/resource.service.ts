import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Resource } from './entities/resource.entity';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourceService {
  constructor(
    @InjectModel(Resource)
    private readonly resourceModel: typeof Resource,
  ) {}

  async create(userId: number, dto: CreateResourceDto): Promise<Resource> {
    return this.resourceModel.create({
      user_id: userId,
      name: dto.name,
      type: dto.type,
      content: dto.content,
    });
  }

  async findAll(userId: number): Promise<Resource[]> {
    return this.resourceModel.findAll({ where: { user_id: userId } });
  }

  async findOne(id: number, userId: number): Promise<Resource> {
    const resource = await this.resourceModel.findOne({
      where: { id, user_id: userId },
    });
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return resource;
  }

  async update(
    id: number,
    userId: number,
    dto: UpdateResourceDto,
  ): Promise<Resource> {
    const resource = await this.findOne(id, userId);
    return resource.update(dto);
  }

  async remove(id: number, userId: number): Promise<void> {
    const resource = await this.findOne(id, userId);
    await resource.destroy();
  }
}
