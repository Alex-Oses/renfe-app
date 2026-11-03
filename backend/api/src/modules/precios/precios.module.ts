import { Module } from '@nestjs/common';
import { PreciosController } from './precios.controller.js';
import { PreciosService } from './precios.service.js';

@Module({
  controllers: [PreciosController],
  providers: [PreciosService],
})
export class PreciosModule {}
