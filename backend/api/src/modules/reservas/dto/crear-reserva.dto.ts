import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import { EXTRAS, FACTOR_TARIFA, PCT_DESCUENTO, TIPOS_VIAJERO, type TipoViajero } from '../../../common/simulado/precio.js';
import { FEEDS, type Feed } from '../../estaciones/dto/buscar-estaciones.dto.js';

export class PasajeroDto {
  @ApiProperty({ description: 'Nombre completo del viajero (va en el QR)', example: 'Lucía Pérez Gómez' })
  @IsString()
  @Length(1, 120)
  nombre!: string;

  @ApiProperty({
    description: 'DNI/NIE/pasaporte; se guarda completo y el QR solo lleva los 4 últimos',
    example: '12345678Z',
  })
  @IsString()
  @Length(4, 20)
  documento!: string;

  @ApiProperty({ required: false, enum: TIPOS_VIAJERO, description: 'Niño (4-13): 40 % de descuento' })
  @IsOptional()
  @IsIn(TIPOS_VIAJERO)
  tipo?: TipoViajero;
}

export class CrearReservaDto {
  @ApiProperty({ enum: FEEDS, description: 'Feed del viaje' })
  @IsIn(FEEDS)
  feed!: Feed;

  @ApiProperty({ description: '`tripId` de GTFS', example: '3097L23537C1' })
  @IsString()
  @Length(1, 120)
  viajeId!: string;

  @ApiProperty({ description: 'Fecha de servicio (AAAA-MM-DD)', example: '2026-11-02' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fecha!: string;

  @ApiProperty({ description: 'Estación de subida', example: '60000' })
  @IsString()
  @Length(1, 40)
  origenId!: string;

  @ApiProperty({ description: 'Estación de bajada', example: '04040' })
  @IsString()
  @Length(1, 40)
  destinoId!: string;

  @ApiProperty({
    description: 'Un pasajero por butaca (máximo 6). Se asigna la butaca automáticamente',
    type: [PasajeroDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => PasajeroDto)
  pasajeros!: PasajeroDto[];

  @ApiProperty({
    description: 'Butacas elegidas (`coche-asiento`), una por pasajero. Sin ellas se asignan solas',
    example: ['1-2A'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @Matches(/^\d-\d{1,2}[A-D]$/, { each: true })
  asientos?: string[];

  @ApiProperty({ required: false, enum: Object.keys(FACTOR_TARIFA) })
  @IsOptional()
  @IsIn(Object.keys(FACTOR_TARIFA))
  tarifa?: string;

  @ApiProperty({ required: false, enum: Object.keys(PCT_DESCUENTO) })
  @IsOptional()
  @IsIn(Object.keys(PCT_DESCUENTO))
  descuento?: string;

  @ApiProperty({ required: false, isArray: true, enum: Object.keys(EXTRAS) })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsIn(Object.keys(EXTRAS), { each: true })
  extras?: string[];
}
