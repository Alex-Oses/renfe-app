import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
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
}
