import { Body, Controller, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
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

  @Post(':localizador/cancelar')
  @HttpCode(200)
  @UseGuards(SupabaseJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancela una reserva propia y anula sus billetes (reembolso simulado)' })
  @ApiOkResponse({ description: '`{ localizador, estado, total, penalizacion, reembolso }`' })
  @ApiBadRequestResponse({ description: 'El viaje ya ha pasado' })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido' })
  @ApiNotFoundResponse({ description: 'No existe o es de otro usuario' })
  @ApiConflictResponse({ description: 'Ya está cancelada o algún billete está usado' })
  @ApiServiceUnavailableResponse({ description: 'La base de datos no está disponible' })
  cancelar(@Req() peticion: PeticionConUsuario, @Param('localizador') localizador: string) {
    return this.reservas.cancelar(peticion.usuario.id, localizador);
  }
}
