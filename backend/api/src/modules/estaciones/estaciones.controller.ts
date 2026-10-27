import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BuscarEstacionesDto } from './dto/buscar-estaciones.dto.js';
import { EstacionesService } from './estaciones.service.js';

@ApiTags('estaciones')
@Controller('estaciones')
export class EstacionesController {
  constructor(private readonly estaciones: EstacionesService) {}

  @Get()
  @ApiOperation({ summary: 'Busca estaciones por nombre, sin tildes ni mayúsculas' })
  @ApiOkResponse({
    description: 'Estaciones encontradas, con los feeds en los que se publican',
  })
  buscar(@Query() filtros: BuscarEstacionesDto) {
    return this.estaciones.buscar(filtros);
  }
}
