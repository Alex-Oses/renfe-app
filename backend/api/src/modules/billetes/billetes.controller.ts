import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import type { UsuarioAutenticado } from '../../common/auth/auth.types.js';
import { Roles } from '../../common/auth/roles.decorator.js';
import { RolesGuard } from '../../common/auth/roles.guard.js';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard.js';
import { BilletesService } from './billetes.service.js';
import { ValidarBilleteDto } from './dto/validar-billete.dto.js';

type PeticionConUsuario = Request & { usuario: UsuarioAutenticado };

@ApiTags('billetes')
@Controller('billetes')
export class BilletesController {
  constructor(private readonly billetes: BilletesService) {}

  @Get()
  @UseGuards(SupabaseJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mis billetes, del más nuevo al más viejo' })
  @ApiOkResponse({ description: '`{ datos: Billete[], total }`' })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido' })
  @ApiServiceUnavailableResponse({ description: 'La base de datos no está disponible' })
  listar(@Req() peticion: PeticionConUsuario) {
    return this.billetes.listar(peticion.usuario.id);
  }

  @Get(':id/qr')
  @UseGuards(SupabaseJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'QR firmado de un billete propio' })
  @ApiOkResponse({ description: '`{ id, qr }` con el token `RNF1.…` ya firmado' })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido' })
  @ApiNotFoundResponse({ description: 'No existe o es de otro usuario' })
  @ApiServiceUnavailableResponse({ description: 'La base de datos no está disponible' })
  qr(@Req() peticion: PeticionConUsuario, @Param('id') id: string) {
    return this.billetes.qr(peticion.usuario.id, id);
  }

  @Post('validar')
  @UseGuards(SupabaseJwtGuard, RolesGuard)
  @Roles('revisor', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'El revisor escanea un QR de billete o de abono' })
  @ApiOkResponse({
    description: 'Siempre 200 si el QR se ha podido procesar: el veredicto va en `estado`',
  })
  @ApiBadRequestResponse({ description: 'Falta `qr`' })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido' })
  @ApiForbiddenResponse({ description: 'Sin rol de revisor o admin' })
  @ApiServiceUnavailableResponse({ description: 'La base de datos no está disponible' })
  validar(@Req() peticion: PeticionConUsuario, @Body() datos: ValidarBilleteDto) {
    return this.billetes.validar(peticion.usuario.id, datos);
  }
}
