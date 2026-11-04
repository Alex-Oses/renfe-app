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
import { FEEDS, type Feed } from '../../estaciones/dto/buscar-estaciones.dto.js';
import {
  IDS_DESCUENTO,
  IDS_EXTRA,
  IDS_TARIFA,
  type IdDescuento,
  type IdExtra,
  type IdTarifa,
} from '../../../common/simulado/precios.js';
import { PasajeroDto } from './crear-reserva.dto.js';

// Un tramo del transbordo: los campos de CrearReservaDto salvo pasajeros, tarifa,
// descuento y extras, que son comunes a los dos tramos.
export class TramoDto {
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
    description: 'Butacas elegidas (`coche-asiento`), una por pasajero. Sin ellas se asignan solas',
    example: ['1-2A'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @Matches(/^\d-\d{1,2}[A-D]$/, { each: true })
  asientos?: string[];
}

export class CrearTransbordoDto {
  @ApiProperty({
    description: 'Los dos tramos del transbordo (exactamente 2)',
    type: [TramoDto],
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => TramoDto)
  tramos!: TramoDto[];

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

  @ApiProperty({ enum: IDS_TARIFA, description: 'Por defecto, básico', required: false })
  @IsOptional()
  @IsIn(IDS_TARIFA)
  tarifa?: IdTarifa;

  @ApiProperty({ enum: IDS_DESCUENTO, description: 'Por defecto, sin descuento', required: false })
  @IsOptional()
  @IsIn(IDS_DESCUENTO)
  descuento?: IdDescuento;

  @ApiProperty({ enum: IDS_EXTRA, isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsIn(IDS_EXTRA, { each: true })
  extras?: IdExtra[];
}
