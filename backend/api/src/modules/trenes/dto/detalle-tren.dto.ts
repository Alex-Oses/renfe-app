import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, Matches } from 'class-validator';
import { FEEDS, type Feed } from '../../../common/gtfs/feeds.js';

export class ParametrosTrenDto {
  @ApiProperty({ enum: FEEDS })
  @IsIn(FEEDS)
  feed!: Feed;

  @ApiProperty({ description: '`trip_id` de GTFS (URL-encoded)', example: '3097L23537C1' })
  @IsString()
  tripId!: string;
}

export class DetalleTrenDto {
  @ApiProperty({ description: 'Fecha local de servicio', example: '2026-11-02' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'fecha debe tener el formato AAAA-MM-DD' })
  fecha!: string;
}
