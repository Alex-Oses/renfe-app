import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BdModule } from './common/bd/bd.module.js';
import { validarEntorno } from './config/entorno.js';
import { AbonosModule } from './modules/abonos/abonos.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { BilletesModule } from './modules/billetes/billetes.module.js';
import { EstacionesModule } from './modules/estaciones/estaciones.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { PosicionesModule } from './modules/posiciones/posiciones.module.js';
import { ReservasModule } from './modules/reservas/reservas.module.js';
import { TrenesModule } from './modules/trenes/trenes.module.js';
import { ChatbotModule } from './modules/chatbot/chatbot.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Un solo .env: el de la raíz del repo (en Docker no existe y se usan las variables del entorno).
      envFilePath: ['../../.env', '.env'],
      validate: validarEntorno,
    }),
    BdModule,
    HealthModule,
    AuthModule,
    EstacionesModule,
    TrenesModule,
    PosicionesModule,
    ReservasModule,
    BilletesModule,
    AbonosModule,
    ChatbotModule,
  ],
})
export class AppModule {}
