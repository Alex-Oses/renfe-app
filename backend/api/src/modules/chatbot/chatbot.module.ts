import { Module } from '@nestjs/common';
import { EstacionesModule } from '../estaciones/estaciones.module.js';
import { PosicionesModule } from '../posiciones/posiciones.module.js';
import { TrenesModule } from '../trenes/trenes.module.js';
import { ChatbotController } from './chatbot.controller.js';
import { ChatbotService } from './chatbot.service.js';
import { GeminiProvider } from './gemini.provider.js';

@Module({
  imports: [EstacionesModule, TrenesModule, PosicionesModule],
  controllers: [ChatbotController],
  providers: [ChatbotService, GeminiProvider],
})
export class ChatbotModule {}
