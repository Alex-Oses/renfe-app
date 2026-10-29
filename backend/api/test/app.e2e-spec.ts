import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

process.env.JWT_SECRET = 'e2e-secret-with-at-least-32-characters';

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modulo.createNestApplication();
    // Lo mismo que hace main.ts, para que la validación se comporte igual.
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health responde 200 con estado ok', async () => {
    const respuesta = await request(app.getHttpServer()).get('/health').expect(200);
    expect(respuesta.body).toMatchObject({ estado: 'ok' });
  });

  it('GET /estaciones sin q responde 400', async () => {
    await request(app.getHttpServer()).get('/estaciones').expect(400);
  });

  it('GET /trenes sin parámetros responde 400', async () => {
    await request(app.getHttpServer()).get('/trenes').expect(400);
  });

  it('GET /trenes con fecha mal formada responde 400', async () => {
    await request(app.getHttpServer())
      .get('/trenes?origen=60000&destino=71801&fecha=02-11-2026')
      .expect(400);
  });

  it('GET /trenes/:feed/:tripId/posicion con feed inválido responde 400', async () => {
    await request(app.getHttpServer()).get('/trenes/ave/0019012026-10-27/posicion').expect(400);
  });
});
