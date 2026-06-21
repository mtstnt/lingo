import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Material } from './entities/material.entity';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';

@Module({
  imports: [SequelizeModule.forFeature([Material])],
  controllers: [MaterialController],
  providers: [MaterialService],
  exports: [MaterialService],
})
export class MaterialModule {}
