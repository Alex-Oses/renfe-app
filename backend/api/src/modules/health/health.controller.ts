import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BdService } from '../../common/bd/bd.service.js';

@ApiTags('sistema')
@Controller('health')
export class HealthController {
  constructor(private readonly bd: BdService) {}

  @Get()
  @ApiOperation({ summary: 'Estado del servicio y de la base de datos' })
  @ApiOkResponse({ description: 'El servicio responde' })
  async estado() {
    return {
      estado: 'ok',
      baseDatos: await this.bd.estado(),
      version: '0.1.0',
      uptimeSeg: Math.round(process.uptime()),
      fecha: new Date().toISOString(),
    };
  }
}
