import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
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
import { CaraService } from './cara.service.js';
import { RegistrarCaraDto } from './dto/registrar-cara.dto.js';
import { ResetearCaraDto } from './dto/resetear-cara.dto.js';
import { VerificarCaraDto } from './dto/verificar-cara.dto.js';

type PeticionConUsuario = Request & { usuario: UsuarioAutenticado };

@ApiTags('auth')
@Controller('auth/cara')
export class CaraController {
  constructor(private readonly cara: CaraService) {}

  @Post('registrar')
  @UseGuards(SupabaseJwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Guarda la plantilla facial del usuario autenticado (una sola vez)' })
  @ApiNoContentResponse({ description: 'Plantilla guardada' })
  @ApiBadRequestResponse({ description: 'Modelo distinto, vector vacío o que no tiene 512 floats' })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido' })
  @ApiNotFoundResponse({ description: 'El usuario no existe' })
  @ApiConflictResponse({ description: 'La cara ya estaba registrada' })
  @ApiServiceUnavailableResponse({ description: 'La base de datos no está disponible' })
  registrar(@Req() peticion: PeticionConUsuario, @Body() datos: RegistrarCaraDto): Promise<void> {
    return this.cara.registrar(peticion.usuario.id, datos);
  }

  @Post('reset')
  @UseGuards(SupabaseJwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Un admin borra la plantilla de un usuario para que vuelva a registrarse',
  })
  @ApiNoContentResponse({ description: 'Plantilla borrada (o no había)' })
  @ApiForbiddenResponse({ description: 'El que llama no es admin; lo decide Postgres' })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido' })
  @ApiServiceUnavailableResponse({ description: 'La base de datos no está disponible' })
  resetear(@Req() peticion: PeticionConUsuario, @Body() datos: ResetearCaraDto): Promise<void> {
    return this.cara.resetear(peticion.usuario.id, datos);
  }

  @Post('verificar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login facial: compara el vector y devuelve una sesión' })
  @ApiOkResponse({ description: 'Mismo shape que `/auth/login`: `{ token, usuario }`' })
  @ApiBadRequestResponse({ description: 'Email inválido o vector que no tiene 512 floats' })
  @ApiUnauthorizedResponse({ description: 'No coincide, sin plantilla o modelo distinto' })
  @ApiServiceUnavailableResponse({ description: 'La base de datos no está disponible' })
  verificar(@Body() datos: VerificarCaraDto) {
    return this.cara.verificar(datos);
  }
}
