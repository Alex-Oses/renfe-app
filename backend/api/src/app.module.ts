import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BdModule } from './common/bd/bd.module.js';
import { validarEntorno } from './config/entorno.js';
import { EstacionesModule } from './modules/estaciones/estaciones.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { TrenesModule } from './modules/trenes/trenes.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validarEntorno }),
    BdModule,
    HealthModule,
    EstacionesModule,
    TrenesModule,
  ],
})
export class AppModule {}
