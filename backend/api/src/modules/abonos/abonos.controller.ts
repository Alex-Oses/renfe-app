import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
import { AbonosService } from './abonos.service.js';
import { CrearAbonoDto } from './dto/crear-abono.dto.js';

type PeticionConUsuario = Request & { usuario: UsuarioAutenticado };

@ApiTags('abonos')
@Controller('abonos')
export class AbonosController {
  constructor(private readonly abonos: AbonosService) {}

  @Get()
  @UseGuards(SupabaseJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mis abonos y bonos, del más nuevo al más viejo' })
  @ApiOkResponse({ description: '`{ datos: Abono[], total }`' })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido' })
  @ApiServiceUnavailableResponse({ description: 'La base de datos no está disponible' })
  listar(@Req() peticion: PeticionConUsuario) {
    return this.abonos.listar(peticion.usuario.id);
  }

  @Post()
  @UseGuards(SupabaseJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Compra simulada de un abono o bono: nace activo y con QR' })
  @ApiCreatedResponse({ description: 'El abono con su QR `RNA1.…` firmado' })
  @ApiBadRequestResponse({ description: 'Tipo, trayecto o fecha inválidos' })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido' })
  @ApiNotFoundResponse({ description: 'Estación de origen o destino inexistente' })
  @ApiServiceUnavailableResponse({ description: 'La base de datos no está disponible' })
  crear(@Req() peticion: PeticionConUsuario, @Body() datos: CrearAbonoDto) {
    return this.abonos.crear(peticion.usuario.id, datos);
  }

  @Get(':id')
  @UseGuards(SupabaseJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Un abono propio con su QR firmado' })
  @ApiOkResponse({ description: 'El abono con su QR `RNA1.…`' })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido' })
  @ApiNotFoundResponse({ description: 'No existe o es de otro usuario' })
  @ApiServiceUnavailableResponse({ description: 'La base de datos no está disponible' })
  detalle(@Req() peticion: PeticionConUsuario, @Param('id') id: string) {
    return this.abonos.detalle(peticion.usuario.id, id);
  }
}
