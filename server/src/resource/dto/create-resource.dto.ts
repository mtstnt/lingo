import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { ResourceType } from '../entities/resource.entity';

export class CreateResourceDto {
  @ApiProperty({ example: 'My vocabulary list' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: ['text', 'url', 'image', 'video'], example: 'text' })
  @IsEnum(['text', 'url', 'image', 'video'])
  type!: ResourceType;

  @ApiProperty({ example: 'Hello, goodbye, thank you' })
  @IsString()
  @IsNotEmpty()
  content!: string;
}
