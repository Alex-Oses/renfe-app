import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class BuscarTrenesDto {
  @ApiProperty({ description: '`id` de la estación de origen', example: '60000' })
  @IsString()
  origen!: string;

  @ApiProperty({ description: '`id` de la estación de destino', example: '71801' })
  @IsString()
  destino!: string;

  @ApiProperty({ description: 'Fecha local de servicio', example: '2026-11-02' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'fecha debe tener el formato AAAA-MM-DD' })
  fecha!: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 20;
}
