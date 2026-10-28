import { Module } from '@nestjs/common';
import { CaraController } from './cara.controller.js';
import { CaraService } from './cara.service.js';

@Module({
  controllers: [CaraController],
  providers: [CaraService],
})
export class AuthModule {}
