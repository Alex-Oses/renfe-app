import { describe, expect, it } from "vitest";
import {
  aDetalleTren,
  aTren,
  desplazarHora,
  marcarParadas,
  nombreDeTren,
  numeroDeServicio,
  sinProducto,
  tipoDeServicio,
} from "./adaptador-trenes";
import type { TrenApi, TrenDetalleApi } from "./tipos";

const trenApi: TrenApi = {
  id: "avld:3097L23537C1:2026-11-02",
  feed: "avld",
  tripId: "3097L23537C1",
  fecha: "2026-11-02",
  linea: "AVE 02070",
  tipo: "AVE",
  numero: "02070",
  origen: { id: "60000", nombre: "Madrid-Puerta de Atocha" },
  destino: { id: "71801", nombre: "Barcelona-Sants" },
  salida: "2026-11-02T07:15:00+01:00",
  llegada: "2026-11-02T09:40:00+01:00",
  duracionMin: 145,
  numParadas: 3,
  retrasoSeg: null,
  precioDesde: 45,
  plazasLibres: 12,
};

describe("tipoDeServicio", () => {
  it("traduce rutas.tipo_servicio a los productos de la UI", () => {
    expect(tipoDeServicio("AVE", "avld")).toBe("AVE");
    expect(tipoDeServicio("ALVIA", "avld")).toBe("Alvia");
    expect(tipoDeServicio("AVLO", "avld")).toBe("Avlo");
    expect(tipoDeServicio("INTERCITY", "avld")).toBe("Intercity");
    expect(tipoDeServicio("MD", "avld")).toBe("Media Distancia");
    expect(tipoDeServicio("REGIONAL EXPRESS", "avld")).toBe("Media Distancia");
    expect(tipoDeServicio("CERCANIAS", "cercanias")).toBe("Cercanías");
  });

  it("lo que no reconoce lo resuelve por el feed, como el mapa", () => {
    expect(tipoDeServicio("DESCONOCIDO", "avld")).toBe("Larga Distancia");
    expect(tipoDeServicio(null, "cercanias")).toBe("Cercanías");
    expect(tipoDeServicio(undefined, undefined)).toBe("Larga Distancia");
  });
});

describe("numeroDeServicio y nombreDeTren", () => {
  it("usa el número del contrato y, si viene null, el final de la línea", () => {
    expect(numeroDeServicio("02070", "AVE 02070")).toBe("02070");
    expect(numeroDeServicio(null, "AVE 02070")).toBe("02070");
    expect(numeroDeServicio(null, "C-4")).toBe("");
    expect(numeroDeServicio(undefined, undefined)).toBe("");
  });

  it("nunca deja el nombre del tren vacío o con un espacio suelto", () => {
    expect(nombreDeTren({ tipo: "AVE", numero: "02070" })).toBe("AVE 02070");
    expect(nombreDeTren({ tipo: "AVE", numero: "", linea: "AVE 02070" })).toBe("AVE 02070");
    expect(nombreDeTren({ tipo: "Cercanías", numero: "", linea: "C-4" })).toBe("C-4");
    expect(nombreDeTren({ tipo: "Cercanías", numero: "" })).toBe("Cercanías");
  });
});

describe("sinProducto", () => {
  it("quita el producto cuando el nombre ya lo trae, para no repetir el tipo", () => {
    expect(sinProducto("AVE 02070", "AVE")).toBe("02070");
    expect(sinProducto("AVLO 0713", "Avlo")).toBe("0713");
    expect(sinProducto("  Alvia 00693 ", "Alvia")).toBe("00693");
  });

  it("deja el nombre tal cual si el producto no coincide ni viene", () => {
    expect(sinProducto("AVANT 08022", "AVE")).toBe("AVANT 08022");
    expect(sinProducto("02070", "AVE")).toBe("02070");
    expect(sinProducto("", "AVE")).toBe("");
  });
});

describe("aTren", () => {
  it("adapta la respuesta de /trenes sin perder campos del contrato", () => {
    const t = aTren(trenApi);
    expect(t.tipo).toBe("AVE");
    expect(t.numero).toBe("02070");
    expect(t.linea).toBe("AVE 02070");
    expect(t.duracionMin).toBe(145);
    expect(t.precioDesde).toBe(45);
  });

  it("con numero null saca el número de la línea", () => {
    expect(aTren({ ...trenApi, numero: null }).numero).toBe("02070");
  });
});

describe("aDetalleTren", () => {
  it("adapta las paradas y calcula la duración del viaje", () => {
    const detalle: TrenDetalleApi = {
      feed: "avld",
      tripId: "3097L23537C1",
      fecha: "2026-11-02",
      linea: "AVE 02070",
      tipo: "AVE",
      numero: null,
      origen: { id: "60000", nombre: "Madrid-Puerta de Atocha" },
      destino: { id: "04040", nombre: "Zaragoza-Delicias" },
      salida: "2026-11-02T07:15:00+01:00",
      llegada: "2026-11-02T08:32:00+01:00",
      retrasoSeg: null,
      paradas: [
        { seq: 1, estacion: { id: "60000", nombre: "Madrid-Puerta de Atocha" }, llega: null, sale: "2026-11-02T07:15:00+01:00", retrasoSeg: null },
        { seq: 2, estacion: { id: "04040", nombre: "Zaragoza-Delicias" }, llega: "2026-11-02T08:32:00+01:00", sale: null, retrasoSeg: null },
      ],
    };
    const d = aDetalleTren(detalle);
    expect(d.id).toBe("avld:3097L23537C1:2026-11-02");
    expect(d.numero).toBe("02070");
    expect(d.duracionMin).toBe(77);
    expect(d.paradas.map((p) => p.nombre)).toEqual(["Madrid-Puerta de Atocha", "Zaragoza-Delicias"]);
    expect(d.paradas[0].llega).toBeNull(); // la primera parada no tiene llegada
  });
});

describe("desplazarHora", () => {
  it("suma el retraso de GTFS-RT a la hora del estático", () => {
    expect(desplazarHora("2026-11-02T07:15:00+01:00", 180)).toBe("2026-11-02T06:18:00.000Z");
    expect(desplazarHora("2026-11-02T07:15:00+01:00", 0)).toBe("2026-11-02T06:15:00.000Z");
  });

  it("admite retraso negativo (tren adelantado) y horas que no existen", () => {
    expect(desplazarHora("2026-11-02T07:15:00+01:00", -120)).toBe("2026-11-02T06:13:00.000Z");
    expect(desplazarHora(null, 60)).toBeNull();
  });
});

describe("marcarParadas", () => {
  const parada = (id: string, hora: string, lat?: number, lon?: number) => ({
    seq: 1,
    estacionId: id,
    nombre: id,
    llega: hora,
    sale: null,
    retrasoSeg: null,
    ...(lat !== undefined && { lat }),
    ...(lon !== undefined && { lon }),
  });

  it("solo pinta las paradas con coordenadas y hora", () => {
    const r = marcarParadas([
      parada("a", "2020-01-01T10:00:00+01:00", 40, -3),
      parada("b", "2020-01-01T10:10:00+01:00"), // sin coordenadas
      parada("c", "", 41, -2), // sin hora válida
    ]);
    expect(r.map((p) => p.estacionId)).toEqual(["a"]);
  });

  it("da por pasadas las paradas anteriores al reloj", () => {
    const r = marcarParadas([
      parada("a", "2020-01-01T10:00:00+01:00", 40, -3),
      parada("b", "2099-01-01T10:00:00+01:00", 41, -2),
    ]);
    expect(r.map((p) => p.pasada)).toEqual([true, false]);
  });

  it("usa la salida cuando la parada no tiene llegada", () => {
    const r = marcarParadas([
      { seq: 1, estacionId: "a", nombre: "a", llega: null, sale: "2020-01-01T10:00:00+01:00", retrasoSeg: null, lat: 40, lon: -3 },
    ]);
    expect(r[0].llegada).toBe("2020-01-01T10:00:00+01:00");
    expect(r[0].pasada).toBe(true);
  });
});
