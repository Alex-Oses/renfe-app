import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import type { UsuarioAutenticado } from '../../common/auth/auth.types.js';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard.js';
import { CrearReservaDto } from './dto/crear-reserva.dto.js';
import { ReservasService } from './reservas.service.js';

type PeticionConUsuario = Request & { usuario: UsuarioAutenticado };

@ApiTags('reservas')
@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservas: ReservasService) {}

  @Post()
  @UseGuards(SupabaseJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crea una reserva pagada (pago simulado) y emite un billete con QR por butaca',
  })
  @ApiCreatedResponse({ description: 'Reserva con sus billetes y QR firmados' })
  @ApiBadRequestResponse({ description: 'Fecha pasada o tramo inválido' })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido' })
  @ApiNotFoundResponse({ description: 'El viaje no circula ese día o el trayecto no existe' })
  @ApiConflictResponse({ description: 'No quedan butacas libres' })
  @ApiServiceUnavailableResponse({ description: 'La base de datos no está disponible' })
  crear(@Req() peticion: PeticionConUsuario, @Body() datos: CrearReservaDto) {
    return this.reservas.crear(peticion.usuario.id, datos);
  }
}
