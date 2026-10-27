import { Module } from '@nestjs/common';
import { PosicionesController } from './posiciones.controller.js';
import { PosicionesService } from './posiciones.service.js';

@Module({
  controllers: [PosicionesController],
  providers: [PosicionesService],
})
export class PosicionesModule {}
