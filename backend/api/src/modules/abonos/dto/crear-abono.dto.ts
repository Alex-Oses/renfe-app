import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Length, Matches } from 'class-validator';
import { TIPOS_ABONO, type TipoAbono } from '../productos.js';

export class CrearAbonoDto {
  @ApiProperty({ enum: TIPOS_ABONO, example: 'bono-10' })
  @IsIn(TIPOS_ABONO)
  tipo!: TipoAbono;

  @ApiPropertyOptional({
    description: 'Estación de origen del trayecto (obligatoria salvo en Cercanías)',
    example: '60000',
  })
  @IsOptional()
  @IsString()
  @Length(1, 40)
  origenId?: string;

  @ApiPropertyOptional({ description: 'Estación de destino', example: '04040' })
  @IsOptional()
  @IsString()
  @Length(1, 40)
  destinoId?: string;

  @ApiProperty({ description: 'Primer día válido (AAAA-MM-DD)', example: '2026-11-01' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  inicio!: string;
}
