import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsNumber } from 'class-validator';

/** Vector ArcFace de 512 floats. Lo calcula el dispositivo; la imagen no sale de él. */
export class EmbeddingDto {
  @ApiProperty({
    description: 'Vector facial de 512 floats',
    example: [0.031, -0.118, 0.204],
    minItems: 512,
    maxItems: 512,
  })
  @IsArray()
  @ArrayMinSize(512)
  @ArrayMaxSize(512)
  @IsNumber({}, { each: true })
  embedding!: number[];
}
