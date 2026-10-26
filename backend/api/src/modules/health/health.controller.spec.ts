import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('devuelve estado ok', async () => {
    const modulo = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    const respuesta = modulo.get(HealthController).estado();

    expect(respuesta).toMatchObject({ estado: 'ok' });
    expect(respuesta.uptimeSeg).toBeGreaterThanOrEqual(0);
  });
});
