import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { EmbeddingDto } from './embedding.dto.js';

export class VerificarCaraDto extends EmbeddingDto {
  @ApiProperty({ description: 'Email con el que se registró la cara', example: 'ana@ejemplo.es' })
  @IsEmail()
  email!: string;
}
