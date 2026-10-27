import { Module } from '@nestjs/common';
import { PosicionesModule } from '../posiciones/posiciones.module.js';
import { TrenesController } from './trenes.controller.js';
import { TrenesService } from './trenes.service.js';

@Module({
  imports: [PosicionesModule],
  controllers: [TrenesController],
  providers: [TrenesService],
})
export class TrenesModule {}
