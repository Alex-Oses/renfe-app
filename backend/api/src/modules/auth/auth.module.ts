import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { CaraController } from './cara.controller.js';
import { CaraService } from './cara.service.js';

@Module({
  controllers: [AuthController, CaraController],
  providers: [AuthService, CaraService],
})
export class AuthModule {}
