import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('sistema')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Estado del servicio' })
  @ApiOkResponse({ description: 'El servicio responde' })
  estado() {
    // Cuando exista la BD, aquí se añade el ping a Postgres (fase F1).
    return {
      estado: 'ok',
      version: '0.1.0',
      uptimeSeg: Math.round(process.uptime()),
      fecha: new Date().toISOString(),
    };
  }
}
