import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
import {
  IDS_DESCUENTO,
  IDS_EXTRA,
  IDS_TARIFA,
  IDS_TIPO_VIAJERO,
  type IdDescuento,
  type IdExtra,
  type IdTarifa,
  type TipoViajero,
} from '../../../common/simulado/precios.js';
import { FEEDS, type Feed } from '../../estaciones/dto/buscar-estaciones.dto.js';

export class PasajeroPrecioDto {
  @ApiPropertyOptional({ enum: IDS_TIPO_VIAJERO, description: 'Sin tipo, adulto' })
  @IsOptional()
  @IsIn(IDS_TIPO_VIAJERO)
  tipo?: TipoViajero;
}

export class CalcularPreciosDto {
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

  @ApiProperty({ description: 'De 1 a 6 pasajeros; solo cuenta el tipo', type: [PasajeroPrecioDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => PasajeroPrecioDto)
  pasajeros!: PasajeroPrecioDto[];

  @ApiPropertyOptional({ enum: IDS_TARIFA, description: 'Sin tarifa, básico' })
  @IsOptional()
  @IsIn(IDS_TARIFA)
  tarifa?: IdTarifa;

  @ApiPropertyOptional({ enum: IDS_DESCUENTO, description: 'Sin descuento, ninguno' })
  @IsOptional()
  @IsIn(IDS_DESCUENTO)
  descuento?: IdDescuento;

  @ApiPropertyOptional({ enum: IDS_EXTRA, isArray: true, maxItems: 5 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsIn(IDS_EXTRA, { each: true })
  extras?: IdExtra[];
}
