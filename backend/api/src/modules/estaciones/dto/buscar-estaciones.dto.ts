import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export const FEEDS = ['cercanias', 'avld'] as const;
export type Feed = (typeof FEEDS)[number];

export class BuscarEstacionesDto {
  @ApiProperty({
    description: 'Texto libre; se ignoran tildes y mayúsculas',
    minLength: 1,
    maxLength: 60,
    example: 'atocha',
  })
  @IsString()
  @Length(1, 60)
  q!: string;

  @ApiPropertyOptional({ enum: FEEDS, description: 'Solo estaciones servidas por ese feed' })
  @IsOptional()
  @IsIn(FEEDS)
  feed?: Feed;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 20;
}
