import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsString,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
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
}
