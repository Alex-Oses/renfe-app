import { Body, Controller, Get, HttpCode, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
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
import { CrearTransbordoDto } from './dto/crear-transbordo.dto.js';
import { ReservasService } from './reservas.service.js';
import { BilletesService } from '../billetes/billetes.service.js';

type PeticionConUsuario = Request & { usuario: UsuarioAutenticado };

@ApiTags('reservas')
@Controller('reservas')
export class ReservasController {
  constructor(
    private readonly reservas: ReservasService,
    private readonly billetes: BilletesService,
  ) {}

  @Get()
  @UseGuards(SupabaseJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Una reserva propia por su localizador' })
  @ApiOkResponse({ description: '`{ localizador, total, billetes }`' })
  @ApiBadRequestResponse({ description: 'Localizador con formato inválido' })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido' })
  @ApiNotFoundResponse({ description: 'No existe o es de otro usuario' })
  @ApiServiceUnavailableResponse({ description: 'La base de datos no está disponible' })
  reserva(@Req() peticion: PeticionConUsuario, @Query('localizador') localizador: string) {
    return this.billetes.reservaPorLocalizador(peticion.usuario.id, localizador ?? '');
  }

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

  @Post('transbordo')
  @UseGuards(SupabaseJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Compra los dos tramos de un transbordo en una sola transacción',
    description:
      'Si el segundo tramo falla no queda ninguna reserva: no se cobra medio viaje.',
  })
  @ApiCreatedResponse({ description: '`{ reservas, total }`' })
  @ApiBadRequestResponse({ description: 'Fecha pasada, origen = destino en un tramo o tramos ≠ 2' })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido' })
  @ApiNotFoundResponse({ description: 'El viaje no circula ese día o el trayecto no existe' })
  @ApiConflictResponse({ description: 'No quedan butacas libres en algún tramo' })
  @ApiServiceUnavailableResponse({ description: 'La base de datos no está disponible' })
  crearTransbordo(@Req() peticion: PeticionConUsuario, @Body() datos: CrearTransbordoDto) {
    return this.reservas.crearTransbordo(peticion.usuario.id, datos);
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
