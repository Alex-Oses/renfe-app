import { Test } from '@nestjs/testing';
import { BdService } from '../../common/bd/bd.service.js';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('devuelve estado ok y el estado de la BD', async () => {
    const modulo = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: BdService, useValue: { estado: async () => 'no configurada' } }],
    }).compile();

    const respuesta = await modulo.get(HealthController).estado();

    expect(respuesta).toMatchObject({ estado: 'ok', baseDatos: 'no configurada' });
    expect(respuesta.uptimeSeg).toBeGreaterThanOrEqual(0);
  });
});
