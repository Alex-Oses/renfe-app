import { Body, Controller, HttpCode, HttpException, HttpStatus, Post, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ChatbotService } from './chatbot.service.js';
import { MensajeChatbotDto } from './dto/mensaje-chatbot.dto.js';

@ApiTags('chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbot: ChatbotService) {}

  @Post('mensaje')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Respuesta conversacional y herramientas utilizadas' })
  @ApiBadRequestResponse({ description: 'Mensaje inválido' })
  @ApiServiceUnavailableResponse({ description: 'Chatbot no configurado o proveedor no disponible' })
  mensaje(@Body() datos: MensajeChatbotDto) {
    return this.chatbot.responder(datos);
  }

  // Mismo turno que `POST /chatbot/mensaje`, pero en SSE: el frontend ve los pasos mientras la IA
  // consulta la API. El turno puede tardar más que un JSON normal, así que no hay timeout de 8 s.
  @Post('mensaje/flujo')
  @ApiOkResponse({ description: 'Flujo `text/event-stream` con eventos `paso`, `fin` y `error`' })
  @ApiBadRequestResponse({ description: 'Mensaje inválido' })
  async flujo(@Body() datos: MensajeChatbotDto, @Res() respuesta: Response): Promise<void> {
    respuesta.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    respuesta.setHeader('Cache-Control', 'no-cache');
    // Render y nginx no deben acumular el flujo.
    respuesta.setHeader('X-Accel-Buffering', 'no');
    respuesta.flushHeaders();

    const enviar = (evento: string, cuerpo: unknown) =>
      respuesta.write(`event: ${evento}\ndata: ${JSON.stringify(cuerpo)}\n\n`);

    try {
      enviar('fin', await this.chatbot.responder(datos, (paso) => enviar('paso', paso)));
    } catch (error) {
      enviar('error', {
        mensaje:
          error instanceof HttpException ? error.message : 'El asistente no está disponible ahora mismo.',
      });
    } finally {
      respuesta.end();
    }
  }
}
