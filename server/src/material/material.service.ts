import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Material } from './entities/material.entity';

@Injectable()
export class MaterialService {
  constructor(
    @InjectModel(Material)
    private readonly materialModel: typeof Material,
  ) {}

  async findAll(userId: number): Promise<Material[]> {
    return this.materialModel.findAll({ where: { user_id: userId } });
  }

  async findOne(id: number, userId: number): Promise<Material> {
    const material = await this.materialModel.findOne({
      where: { id, user_id: userId },
    });
    if (!material) {
      throw new NotFoundException('Material not found');
    }
    return material;
  }

  async remove(id: number, userId: number): Promise<void> {
    const material = await this.findOne(id, userId);
    await material.destroy();
  }
}
