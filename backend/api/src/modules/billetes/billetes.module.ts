import { Module } from '@nestjs/common';
import { BilletesController } from './billetes.controller.js';
import { BilletesService } from './billetes.service.js';

@Module({
  controllers: [BilletesController],
  providers: [BilletesService],
})
export class BilletesModule {}
