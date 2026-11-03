import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CalcularPreciosDto } from './dto/calcular-precios.dto.js';
import { PreciosService } from './precios.service.js';

@ApiTags('precios')
@Controller('precios')
export class PreciosController {
  constructor(private readonly precios: PreciosService) {}

  @Post('calcular')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importe de una selección antes de reservar' })
  @ApiOkResponse({ description: '`{ precioAsiento, desglose: { billetes, extras, total } }`' })
  @ApiNotFoundResponse({ description: 'Ese viaje no circula en esa fecha o el trayecto no existe' })
  @ApiServiceUnavailableResponse({ description: 'La base de datos no está disponible' })
  calcular(@Body() dto: CalcularPreciosDto) {
    return this.precios.calcular(dto);
  }
}
