import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BuscarTrenesDto } from './dto/buscar-trenes.dto.js';
import { DetalleTrenDto, ParametrosTrenDto } from './dto/detalle-tren.dto.js';
import { TrenesService } from './trenes.service.js';

@ApiTags('trenes')
@Controller('trenes')
export class TrenesController {
  constructor(private readonly trenes: TrenesService) {}

  @Get()
  @ApiOperation({ summary: 'Busca viajes directos entre dos estaciones para una fecha' })
  @ApiOkResponse({ description: 'Viajes directos, ordenados por hora de salida' })
  @ApiNotFoundResponse({ description: 'Alguna de las estaciones no existe' })
  buscar(@Query() filtros: BuscarTrenesDto) {
    return this.trenes.buscar(filtros);
  }

  @Get(':feed/:tripId')
  @ApiOperation({ summary: 'Detalle de un viaje: paradas y horas' })
  @ApiOkResponse({ description: 'Paradas del viaje en orden' })
  @ApiNotFoundResponse({ description: 'Ese viaje no circula en esa fecha' })
  detalle(@Param() { feed, tripId }: ParametrosTrenDto, @Query() { fecha }: DetalleTrenDto) {
    return this.trenes.detalle(feed, tripId, fecha);
  }
}
