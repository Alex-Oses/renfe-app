import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buscarEstaciones,
  buscarTrenes,
  completarRuta,
  configurarApi,
  obtenerAsientos,
  posicionDeTren,
  registrarCara,
} from "./cliente";
import type { PosicionTren, Tren } from "./tipos";

const vector = (n: number) => Array.from({ length: n }, () => 0.01);

interface Llamada {
  url: string;
  init?: RequestInit;
}

// Imita a la API con las respuestas del contrato (obsidian/02-contratos-api/endpoints.md).
function api(manejador: (url: string) => Response | undefined) {
  const llamadas: Llamada[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      llamadas.push({ url, init });
      return manejador(url) ?? new Response("", { status: 404 });
    }),
  );
  return llamadas;
}

const detalle = {
  feed: "avld",
  tripId: "3097L23537C1",
  fecha: "2026-11-02",
  linea: "AVE 02070",
  tipo: "AVE",
  numero: null,
  origen: { id: "60000", nombre: "Madrid-Puerta de Atocha" },
  destino: { id: "04040", nombre: "Zaragoza-Delicias" },
  salida: "2020-11-02T07:15:00+01:00",
  llegada: "2020-11-02T08:32:00+01:00",
  retrasoSeg: null,
  paradas: [
    { seq: 1, estacion: { id: "60000", nombre: "Madrid-Puerta de Atocha" }, llega: null, sale: "2020-11-02T07:15:00+01:00", retrasoSeg: null },
    { seq: 2, estacion: { id: "04040", nombre: "Zaragoza-Delicias" }, llega: "2026-11-02T08:32:00+01:00", sale: null, retrasoSeg: null },
  ],
};

const estaciones = {
  datos: [
    { id: "60000", nombre: "Madrid-Puerta de Atocha", ciudad: "Madrid", lat: 40.4066, lon: -3.6906 },
    { id: "04040", nombre: "Zaragoza-Delicias", ciudad: "Zaragoza", lat: 41.6587, lon: -0.9113 },
  ],
  total: 2,
};

const posicion = (): PosicionTren => ({
  trenId: "avld:3097L23537C1",
  tipo: "Larga Distancia",
  numero: "03272",
  origen: "",
  destino: "",
  lat: 40.4,
  lon: -3.68,
  rumbo: Number.NaN,
  retrasoMin: 3,
  retrasoSeg: 180,
  progreso: 0,
  proximaParada: "",
  actualizado: "2026-11-02T07:20:00+01:00",
  ruta: [],
  paradas: [],
});

afterEach(() => {
  configurarApi({});
  vi.unstubAllGlobals();
});

describe("con VITE_API_URL", () => {
  it("no pregunta por estaciones con el campo vacío (el contrato exige q)", async () => {
    configurarApi({ api: "http://api" });
    const llamadas = api(() => Response.json(estaciones));

    await expect(buscarEstaciones("   ")).resolves.toEqual([]);
    expect(llamadas).toHaveLength(0);

    await expect(buscarEstaciones("atocha")).resolves.toHaveLength(2);
    expect(llamadas[0].url).toBe("http://api/estaciones?q=atocha");
  });

  it("registrar la cara manda embedding y modelo, y acepta el 204 sin cuerpo", async () => {
    configurarApi({ api: "http://api" });
    const llamadas = api(() => new Response(null, { status: 204 }));

    await expect(registrarCara(vector(512))).resolves.toEqual({ ok: true });
    expect(llamadas[0].url).toBe("http://api/auth/cara/registrar");
    expect(llamadas[0].init?.method).toBe("POST");
    const cuerpo = JSON.parse(String(llamadas[0].init?.body));
    expect(cuerpo.modelo).toBe("arcface/w600k_mbf");
    expect(cuerpo.embedding).toHaveLength(512);
  });

  it("no sale a la red con un vector que no es de 512 (ArcFace)", async () => {
    configurarApi({ api: "http://api" });
    const llamadas = api(() => new Response(null, { status: 204 }));

    await expect(registrarCara(vector(1024))).rejects.toThrow(/1024.*512/);
    expect(llamadas).toHaveLength(0);
  });

  it("enseña el mensaje de error del contrato, no el código", async () => {
    configurarApi({ api: "http://api" });
    api(() => Response.json({ statusCode: 409, error: "Conflict", message: "La cara ya estaba registrada" }, { status: 409 }));

    await expect(registrarCara(vector(512))).rejects.toThrow("La cara ya estaba registrada");
  });

  it("buscar trenes adapta el tipo en mayúsculas y el número nulo", async () => {
    configurarApi({ api: "http://api" });
    const tren = { ...detalle, id: "avld:3097L23537C1:2026-11-02", duracionMin: 77, numParadas: 2, precioDesde: 45, plazasLibres: 12 };
    const llamadas = api(() => Response.json({ datos: [tren], total: 1 }));

    const [t] = await buscarTrenes({ origen: "60000", destino: "04040", fecha: "2026-11-02" });
    expect(llamadas[0].url).toBe("http://api/trenes?origen=60000&destino=04040&fecha=2026-11-02");
    expect(t.tipo).toBe("AVE");
    expect(t.numero).toBe("02070");
    expect(t.plazasLibres).toBe(12);
  });

  it("completarRuta pide el detalle, resuelve coordenadas y marca salida y llegada", async () => {
    configurarApi({ api: "http://api" });
    const llamadas = api((url) => {
      if (url.includes("/estaciones?")) return Response.json(estaciones);
      if (url.includes("/trenes/avld/3097L23537C1?fecha=")) return Response.json(detalle);
      return undefined;
    });

    const r = await completarRuta(posicion());
    expect(llamadas.map((l) => l.url)).toContainEqual(
      expect.stringMatching(/\/trenes\/avld\/3097L23537C1\?fecha=\d{4}-\d{2}-\d{2}$/),
    );
    expect(r.ruta).toEqual([
      [40.4066, -3.6906],
      [41.6587, -0.9113],
    ]);
    expect(r.paradas[0].pasada).toBe(true); // salida de 2020: siempre pasada
    expect(r.paradas[1].pasada).toBe(false);
    expect(r.origen).toBe("Madrid-Puerta de Atocha");
    expect(r.destino).toBe("Zaragoza-Delicias");
    expect(r.numero).toBe("02070"); // el contrato da numero null: sale del final de la línea
    expect(r.tipo).toBe("AVE");
    expect(r.progreso).toBe(0.5);
    expect(r.llegadaProxima).toBe("2026-11-02T07:35:00.000Z"); // 08:32 en Madrid + 3 min de retraso
  });

  it("no pregunta por /asientos (la API todavía no lo tiene) y usa la plantilla local", async () => {
    configurarApi({ api: "http://api" });
    const llamadas = api(() => undefined);
    const tren: Tren = {
      id: "avld:3097L23537C1:2026-11-02",
      tipo: "AVE",
      numero: "02070",
      origen: { id: "60000", nombre: "Madrid-Puerta de Atocha" },
      destino: { id: "04040", nombre: "Zaragoza-Delicias" },
      salida: "2026-11-02T07:15:00+01:00",
      llegada: "2026-11-02T08:32:00+01:00",
      precioDesde: 45,
      plazasLibres: 12,
    };

    const asientos = await obtenerAsientos(tren);
    expect(llamadas).toHaveLength(0);
    expect(asientos).toHaveLength(240);
    expect(asientos[0].precio).toBeCloseTo(45 * 1.9, 2); // coche 1 es Prémium
    expect(asientos.some((a) => a.libre)).toBe(true);
  });

  it("si el viaje no está circulando, /posicion da 404 y no es un error", async () => {
    configurarApi({ api: "http://api" });
    api(() => new Response("", { status: 404 }));

    await expect(posicionDeTren("avld:3097L23537C1")).resolves.toBeNull();
  });

  it("con /posicion saca la posición del contrato con su retraso en segundos", async () => {
    configurarApi({ api: "http://api" });
    const llamadas = api(() =>
      Response.json({
        feed: "avld",
        tripId: "3097L23537C1",
        vehicleId: "03272",
        lat: 40.39,
        lon: -3.67,
        rumbo: null,
        velocidadKmh: null,
        estado: "IN_TRANSIT_TO",
        retrasoSeg: 2280,
        actualizado: "2026-10-27T10:27:18+01:00",
      }),
    );

    const p = await posicionDeTren("avld:3097L23537C1");
    expect(llamadas[0].url).toBe("http://api/trenes/avld/3097L23537C1/posicion");
    expect(p?.retrasoSeg).toBe(2280);
    expect(p?.trenId).toBe("avld:3097L23537C1");
  });
});

describe("sin VITE_API_URL", () => {
  it("sigue funcionando con los datos simulados", async () => {
    const llamadas = api(() => undefined);
    const trenes = await buscarTrenes({ origen: "60000", destino: "71801", fecha: "2026-11-02" });
    expect(trenes.length).toBeGreaterThan(0);
    expect(llamadas).toHaveLength(0);
  });
});
