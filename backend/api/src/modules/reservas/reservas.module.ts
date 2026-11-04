import { Module } from '@nestjs/common';
import { CorreoService } from '../../common/correo/correo.service.js';
import { BilletesModule } from '../billetes/billetes.module.js';
import { ReservasController } from './reservas.controller.js';
import { ReservasService } from './reservas.service.js';

@Module({
  imports: [BilletesModule],
  controllers: [ReservasController],
  providers: [ReservasService, CorreoService],
})
export class ReservasModule {}
