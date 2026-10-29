import { Module } from '@nestjs/common';
import { AbonosController } from './abonos.controller.js';
import { AbonosService } from './abonos.service.js';

@Module({
  controllers: [AbonosController],
  providers: [AbonosService],
})
export class AbonosModule {}
