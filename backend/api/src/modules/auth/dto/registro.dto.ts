import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, MaxLength, MinLength } from 'class-validator';

export class RegistroDto {
  @ApiProperty({ description: 'Nombre visible del viajero', example: 'Ana' })
  @IsString()
  @Length(1, 120)
  nombre!: string;

  @ApiProperty({ example: 'ana@ejemplo.es' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Contraseña (la guarda Supabase Auth, nunca la API)', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
