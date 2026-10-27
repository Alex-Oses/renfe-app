import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, Matches } from 'class-validator';
import { FEEDS, type Feed } from '../../../common/gtfs/feeds.js';

export class PosicionesDto {
  @ApiPropertyOptional({
    description: 'Caja geográfica `minLon,minLat,maxLon,maxLat`',
    example: '-9.5,35.9,4.6,43.9',
  })
  @IsOptional()
  @Matches(/^-?\d+(\.\d+)?(,-?\d+(\.\d+)?){3}$/, {
    message: 'bbox debe ser minLon,minLat,maxLon,maxLat',
  })
  bbox?: string;

  @ApiPropertyOptional({ enum: FEEDS })
  @IsOptional()
  @IsIn(FEEDS)
  feed?: Feed;
}
