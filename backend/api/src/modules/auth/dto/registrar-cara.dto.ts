import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { EmbeddingDto } from './embedding.dto.js';

export class RegistrarCaraDto extends EmbeddingDto {
  @ApiProperty({
    description: 'Modelo que calculó el vector; tiene que ser el de `config_cara`',
    example: 'arcface/buffalo_l',
  })
  @IsString()
  @IsNotEmpty()
  modelo!: string;
}
