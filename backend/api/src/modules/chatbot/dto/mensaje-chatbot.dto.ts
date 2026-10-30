import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class MensajeChatbotDto {
  @ApiProperty({ description: 'Pregunta o petición sobre los datos de Renfe', maxLength: 2000 })
  @IsString()
  @Length(1, 2000)
  mensaje!: string;

  @ApiPropertyOptional({ description: 'Identificador opaco para correlacionar la conversación' })
  @IsOptional()
  @IsUUID()
  conversationId?: string;
}
