import { Controller, Get, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BuscarTrenesDto } from './dto/buscar-trenes.dto.js';
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
}
