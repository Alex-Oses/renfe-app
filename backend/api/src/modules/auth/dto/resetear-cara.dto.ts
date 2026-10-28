import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ResetearCaraDto {
  @ApiProperty({ description: 'Usuario al que se le borra la plantilla', format: 'uuid' })
  @IsUUID()
  usuarioId!: string;
}
