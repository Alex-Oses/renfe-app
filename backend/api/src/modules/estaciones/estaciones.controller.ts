import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
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

  @Get(':id')
  @ApiOperation({ summary: 'Una estación por su id' })
  @ApiOkResponse({
    description: 'La estación, con los feeds en los que se publica',
  })
  @ApiNotFoundResponse({ description: 'Esa estación no existe' })
  porId(@Param('id') id: string) {
    return this.estaciones.porId(id);
  }
}
