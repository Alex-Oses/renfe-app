import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validarEntorno } from './config/entorno.js';
import { HealthModule } from './modules/health/health.module.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validate: validarEntorno }), HealthModule],
})
export class AppModule {}
