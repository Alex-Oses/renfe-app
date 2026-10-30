import { Module } from '@nestjs/common';
import { CorreoService } from '../../common/correo/correo.service.js';
import { ReservasController } from './reservas.controller.js';
import { ReservasService } from './reservas.service.js';

@Module({
  controllers: [ReservasController],
  providers: [ReservasService, CorreoService],
})
export class ReservasModule {}
