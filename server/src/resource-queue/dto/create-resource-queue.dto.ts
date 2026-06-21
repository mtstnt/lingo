import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResourceQueueDto {
  @ApiProperty({ example: 1, description: 'ID of the resource to process' })
  @IsInt()
  resource_id!: number;
}
