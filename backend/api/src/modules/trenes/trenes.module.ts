import { Module } from '@nestjs/common';
import { TrenesController } from './trenes.controller.js';
import { TrenesService } from './trenes.service.js';

@Module({
  controllers: [TrenesController],
  providers: [TrenesService],
})
export class TrenesModule {}
