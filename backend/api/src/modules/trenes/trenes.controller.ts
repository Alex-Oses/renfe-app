import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PosicionesService } from '../posiciones/posiciones.service.js';
import { BuscarTrenesDto } from './dto/buscar-trenes.dto.js';
import { DetalleTrenDto, ParametrosTrenDto } from './dto/detalle-tren.dto.js';
import { TrenesService } from './trenes.service.js';

@ApiTags('trenes')
@Controller('trenes')
export class TrenesController {
  constructor(
    private readonly trenes: TrenesService,
    private readonly posiciones: PosicionesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Busca viajes directos entre dos estaciones para una fecha' })
  @ApiOkResponse({ description: 'Viajes directos, ordenados por hora de salida' })
  @ApiNotFoundResponse({ description: 'Alguna de las estaciones no existe' })
  buscar(@Query() filtros: BuscarTrenesDto) {
    return this.trenes.buscar(filtros);
  }

  @Get('transbordos')
  @ApiOperation({ summary: 'Opciones con un transbordo entre dos estaciones para una fecha' })
  @ApiOkResponse({ description: 'Opciones de dos tramos, de menor a mayor duración' })
  transbordos(@Query() filtros: BuscarTrenesDto) {
    return this.trenes.transbordos(filtros);
  }

  @Get(':feed/:tripId')
  @ApiOperation({ summary: 'Detalle de un viaje: paradas y horas' })
  @ApiOkResponse({ description: 'Paradas del viaje en orden' })
  @ApiNotFoundResponse({ description: 'Ese viaje no circula en esa fecha' })
  detalle(@Param() { feed, tripId }: ParametrosTrenDto, @Query() { fecha }: DetalleTrenDto) {
    return this.trenes.detalle(feed, tripId, fecha);
  }

  @Get(':feed/:tripId/posicion')
  @ApiOperation({ summary: 'Última posición conocida del viaje que circula ahora' })
  @ApiOkResponse({ description: 'Posición del tren en el último sondeo de Renfe' })
  @ApiNotFoundResponse({ description: 'Ese viaje no está circulando ahora' })
  @ApiServiceUnavailableResponse({ description: 'Renfe no responde y no hay datos previos' })
  posicion(@Param() { feed, tripId }: ParametrosTrenDto) {
    return this.posiciones.posicionDe(feed, tripId);
  }
}
