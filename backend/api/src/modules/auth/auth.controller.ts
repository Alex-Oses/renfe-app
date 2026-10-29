import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegistroDto } from './dto/registro.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('registro')
  @ApiOperation({ summary: 'Alta con email y contraseña (Supabase Auth) y perfil en la app' })
  @ApiCreatedResponse({ description: 'Sesión iniciada: `{ token, refreshToken, usuario }`' })
  @ApiBadRequestResponse({ description: 'Email, nombre o contraseña inválidos' })
  @ApiConflictResponse({ description: 'Ese email ya está registrado' })
  @ApiServiceUnavailableResponse({ description: 'Supabase Auth o la base de datos no responden' })
  registro(@Body() datos: RegistroDto) {
    return this.auth.registro(datos);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login con email y contraseña (token de Supabase Auth)' })
  @ApiOkResponse({ description: 'Mismo shape que `/auth/cara/verificar`: `{ token, usuario }`' })
  @ApiBadRequestResponse({ description: 'Email o contraseña mal formados' })
  @ApiUnauthorizedResponse({ description: 'Email o contraseña incorrectos' })
  @ApiServiceUnavailableResponse({ description: 'Supabase Auth o la base de datos no responden' })
  login(@Body() datos: LoginDto) {
    return this.auth.login(datos);
  }
}
