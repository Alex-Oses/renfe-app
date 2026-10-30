import { Module } from '@nestjs/common';
import { EstacionesController } from './estaciones.controller.js';
import { EstacionesService } from './estaciones.service.js';

@Module({
  controllers: [EstacionesController],
  providers: [EstacionesService],
  exports: [EstacionesService],
})
export class EstacionesModule {}
