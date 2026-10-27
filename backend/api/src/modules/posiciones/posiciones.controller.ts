import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { PosicionesDto } from './dto/posiciones.dto.js';
import { PosicionesService } from './posiciones.service.js';

@ApiTags('posiciones')
@Controller('posiciones')
export class PosicionesController {
  constructor(private readonly posiciones: PosicionesService) {}

  @Get()
  @ApiOperation({ summary: 'Snapshot de las posiciones GTFS-RT, filtrable por caja geográfica' })
  @ApiOkResponse({ description: 'Posiciones conocidas en el último sondeo de Renfe' })
  @ApiServiceUnavailableResponse({ description: 'Renfe no responde y no hay datos previos' })
  listar(@Query() filtros: PosicionesDto) {
    return this.posiciones.obtener(filtros);
  }
}
