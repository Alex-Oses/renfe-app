import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { SignJWT } from 'jose';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { BdService } from './../src/common/bd/bd.service.js';
import { SERVICIO_ACTIVO } from './../src/common/gtfs/sql.js';

type ViajeDeHoy = {
  feed: string;
  viaje_id: string;
  origen_id: string;
  destino_id: string;
};

// La condición de calendarios es la misma que usa la API; aquí la fecha es `$1`.
const ACTIVO_HOY = SERVICIO_ACTIVO.replaceAll('$3', '$1');

const SQL_VIAJE_DE_HOY = `
  select v.feed, v.id as viaje_id, v.origen_id, v.destino_id
    from viajes v
   where ${ACTIVO_HOY}
   limit 1
`;

/** Fecha de servicio en hora local: el catálogo se consulta por día, no por UTC. */
function hoyLocal(): string {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

const VECTOR = Array.from({ length: 512 }, () => 0.01);

// Sin `DATABASE_URL` no hay nada que comprobar: estos e2e se saltan y CI sigue
// verde. Con la BD de Docker levantada son el botón de «los endpoints funcionan».
describe.skipIf(!process.env.DATABASE_URL)('API con base de datos (e2e)', () => {
  let app: INestApplication<App>;
  let bd: BdService;
  let secreto: string | undefined;
  let modelo: string;
  let viaje: ViajeDeHoy | undefined;

  const fecha = hoyLocal();

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modulo.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    bd = app.get(BdService);
    secreto = app.get(ConfigService).get<string>('SUPABASE_JWT_SECRET');

    const { rows: config } = await bd.consultar<{ modelo: string }>(
      'select modelo from config_cara where id',
    );
    modelo = config[0]?.modelo ?? 'arcface/buffalo_l';

    const { rows } = await bd.consultar<ViajeDeHoy>(SQL_VIAJE_DE_HOY, [fecha]);
    viaje = rows[0];
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health ve la base de datos', async () => {
    const respuesta = await request(app.getHttpServer()).get('/health').expect(200);
    expect(respuesta.body.baseDatos).toBe('ok');
  });

  describe('catálogo', () => {
    it('GET /estaciones devuelve estaciones reales de avld', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/estaciones?q=atocha&feed=avld')
        .expect(200);

      expect(respuesta.body.total).toEqual(expect.any(Number));
      expect(respuesta.body.datos.length).toBeGreaterThan(0);
      for (const estacion of respuesta.body.datos) {
        expect(estacion.id).toEqual(expect.any(String));
        expect(estacion.nombre).toEqual(expect.any(String));
        expect(estacion.ciudad).toEqual(expect.any(String));
        expect(estacion.feeds).toContain('avld');
      }
    });

    it('GET /estaciones sin coincidencias devuelve la lista vacía', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/estaciones?q=zzzzzzzz')
        .expect(200);

      expect(respuesta.body).toMatchObject({ datos: [], total: 0 });
    });
  });

  describe('trenes', () => {
    it('GET /trenes encuentra un viaje que circula hoy', async (ctx) => {
      const elegido = viaje;
      if (!elegido) {
        // Catálogo cargado sin viajes para hoy: no es un fallo de la API.
        ctx.skip();
        return;
      }

      const respuesta = await request(app.getHttpServer())
        .get('/trenes')
        .query({ origen: elegido.origen_id, destino: elegido.destino_id, fecha })
        .expect(200);

      const tren = respuesta.body.datos.find(
        (candidato: { feed: string; tripId: string }) =>
          candidato.feed === elegido.feed && candidato.tripId === elegido.viaje_id,
      );
      expect(tren).toBeDefined();
      expect(tren.salida).toMatch(/^\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
      expect(tren.llegada).toMatch(/^\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
      expect(tren.duracionMin).toBeGreaterThan(0);
      expect(tren.precioDesde).toEqual(expect.any(Number));
      expect(tren.plazasLibres).toEqual(expect.any(Number));
    });

    it('GET /trenes con una estación que no existe responde 404', async () => {
      await request(app.getHttpServer())
        .get('/trenes')
        .query({ origen: 'no-existe', destino: viaje?.destino_id ?? 'tampoco', fecha })
        .expect(404);
    });

    it('GET /trenes/:feed/:tripId devuelve las paradas en orden', async (ctx) => {
      const elegido = viaje;
      if (!elegido) {
        ctx.skip();
        return;
      }

      const respuesta = await request(app.getHttpServer())
        .get(`/trenes/${elegido.feed}/${encodeURIComponent(elegido.viaje_id)}`)
        .query({ fecha })
        .expect(200);

      const paradas = respuesta.body.paradas as { seq: number; estacion: { id: string } }[];
      expect(paradas.length).toBeGreaterThanOrEqual(2);
      expect(paradas[0].estacion.id).toBe(elegido.origen_id);
      expect(paradas.map((parada) => parada.seq)).toEqual(
        [...paradas].map((parada) => parada.seq).sort((a, b) => a - b),
      );
    });
  });

  // El camino feliz (registrar → verificar → reset) necesita un `perfiles` real,
  // que llega con `/auth/registro`. Estos casos ya comprueban que las funciones
  // de Postgres existen y que el SQLSTATE se traduce al HTTP correcto.
  describe('login facial', () => {
    const firmar = (id: string, email: string): Promise<string> => {
      if (!secreto) return Promise.reject(new Error('sin SUPABASE_JWT_SECRET'));
      return new SignJWT({ email })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(id)
        .setIssuedAt()
        .setExpirationTime('5m')
        .sign(new TextEncoder().encode(secreto));
    };

    it('POST /auth/cara/registrar sin perfil responde 404 (RF005)', async (ctx) => {
      if (!secreto) {
        ctx.skip();
        return;
      }

      await request(app.getHttpServer())
        .post('/auth/cara/registrar')
        .set('Authorization', `Bearer ${await firmar(randomUUID(), 'nadie@ejemplo.es')}`)
        .send({ modelo, embedding: VECTOR })
        .expect(404);
    });

    it('POST /auth/cara/reset sin ser admin responde 403 (RF006)', async (ctx) => {
      if (!secreto) {
        ctx.skip();
        return;
      }

      await request(app.getHttpServer())
        .post('/auth/cara/reset')
        .set('Authorization', `Bearer ${await firmar(randomUUID(), 'nadie@ejemplo.es')}`)
        .send({ usuarioId: randomUUID() })
        .expect(403);
    });

    it('POST /auth/cara/verificar con un email desconocido responde 401', async () => {
      await request(app.getHttpServer())
        .post('/auth/cara/verificar')
        .send({ email: `nadie-${Date.now()}@ejemplo.es`, embedding: VECTOR })
        .expect(401);
    });
  });
});
