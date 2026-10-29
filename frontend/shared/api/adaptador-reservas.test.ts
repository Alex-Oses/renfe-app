import { describe, expect, it } from "vitest";
import {
  asientoDeApi,
  billeteDeApi,
  claseDeApi,
  cuerpoReserva,
  datosDeQr,
  reservaDeApi,
  validacionDeApi,
} from "./adaptador-reservas";
import type { BilleteApi, NuevaReserva, Pasajero, ReservaApi, ResultadoValidacionApi, Tren } from "./tipos";

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

const pasajero = (nombre: string, documento = "12345678Z"): Pasajero => ({
  nombre,
  apellidos: "Pérez Gómez",
  documento,
  email: "ana@ejemplo.es",
});

const nueva: NuevaReserva = {
  trenId: tren.id,
  asientos: ["1-1A", "1-1D"],
  pasajeros: [pasajero("Lucía"), pasajero("Marta", "87654321X")],
  tarifa: "elige",
  descuento: "joven",
};

// Igual que la API: los bytes UTF-8 del JSON, en base64url.
const b64url = (texto: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(texto)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
const qrCon = (datos: object) => `RNF1.${b64url(JSON.stringify(datos))}.firma`;

const billeteApi: BilleteApi = {
  id: "1c4a",
  localizador: "R-7K3M9Q",
  estado: "valido",
  tipo: "AVE",
  numero: null,
  salida: "2026-11-02T07:15:00+01:00",
  llegada: "2026-11-02T09:40:00+01:00",
  origen: { id: "60000", nombre: "Madrid-Puerta de Atocha" },
  destino: { id: "04040", nombre: "Zaragoza-Delicias" },
  coche: 3,
  asiento: "12A",
  clase: "Turista",
  precio: 45,
  emitido: "2026-10-29T10:00:00+01:00",
  expira: "2026-11-03T02:00:00+01:00",
  qr: qrCon({ v: 1, id: "1c4a", p: "Lucía Pérez Gómez", doc: "••••678Z" }),
};

describe("cuerpoReserva", () => {
  it("parte el id del tren y manda un pasajero por butaca, sin asientos", () => {
    const cuerpo = cuerpoReserva(tren, nueva);
    expect(cuerpo).toEqual({
      feed: "avld",
      viajeId: "3097L23537C1",
      fecha: "2026-11-02",
      origenId: "60000",
      destinoId: "04040",
      pasajeros: [
        { nombre: "Lucía Pérez Gómez", documento: "12345678Z" },
        { nombre: "Marta Pérez Gómez", documento: "87654321X" },
      ],
    });
    expect(cuerpo).not.toHaveProperty("asientos");
  });

  it("rechaza un tren sin feed, viaje y fecha", () => {
    expect(() => cuerpoReserva({ ...tren, id: "simulado-1" }, nueva)).toThrow(/feed/);
  });

  it("avisa antes de salir a la red si hay más de 6 pasajeros", () => {
    const muchos = { ...nueva, pasajeros: Array.from({ length: 7 }, () => pasajero("Ana")) };
    expect(() => cuerpoReserva(tren, muchos)).toThrow(/1 a 6/);
  });
});

describe("reservaDeApi", () => {
  const creada: ReservaApi = {
    id: "9b2f",
    localizador: "R-7K3M9Q",
    estado: "pagada",
    total: 90,
    creada: "2026-10-29T10:00:00+01:00",
    billetes: [
      { id: "b1", qr: "RNF1.x.y", coche: 1, asiento: "1A", clase: "Confort", precio: 45 },
      { id: "b2", qr: "RNF1.z.w", coche: 1, asiento: "1D", clase: "Confort", precio: 45 },
    ],
  };

  it("pinta las butacas que ha asignado la API y enmascara el documento", () => {
    const r = reservaDeApi(creada, tren, nueva);
    expect(r.localizador).toBe("R-7K3M9Q");
    expect(r.estado).toBe("pagada");
    expect(r.total).toBe(90);
    expect(r.asientos.map((a) => `${a.coche}-${a.fila}${a.letra}`)).toEqual(["1-1A", "1-1D"]);
    expect(r.asientos[0].clase).toBe("Confort");
    expect(r.pasajeros[0].documento).toBe("••••678Z");
    expect(r.pasajeros[1].nombre).toBe("Marta");
    expect(r.tarifa).toBe("elige");
  });

  it("empareja cada billete con su pasajero y conserva el tren buscado", () => {
    const r = reservaDeApi(creada, tren, nueva);
    expect(r.pasajeros).toHaveLength(r.asientos.length);
    expect(r.tren.id).toBe(tren.id);
  });
});

describe("billeteDeApi", () => {
  it("saca fila, letra y clase del billete plano del contrato", () => {
    const b = billeteDeApi(billeteApi);
    expect(b.asiento).toMatchObject({ coche: 3, fila: 12, letra: "A", clase: "Estándar", libre: false });
    expect(b.reservaId).toBe("R-7K3M9Q"); // el contrato no manda el id de la reserva
    expect(b.tren.tipo).toBe("AVE");
    expect(b.tren.numero).toBe(""); // sin número, /billetes tampoco da la línea de la que sacarlo
    expect(b.tren.origen.nombre).toBe("Madrid-Puerta de Atocha");
    expect(b.localizador).toBe("R-7K3M9Q");
  });

  it("usa el número de tren cuando el contrato lo manda", () => {
    expect(billeteDeApi({ ...billeteApi, numero: "02070" }).tren.numero).toBe("02070");
  });

  it("lee al viajero del QR firmado, con tildes", () => {
    const b = billeteDeApi(billeteApi);
    expect(b.pasajero.nombre).toBe("Lucía");
    expect(b.pasajero.apellidos).toBe("Pérez Gómez");
    expect(b.pasajero.documento).toBe("••••678Z");
    expect(b.qr).toBe(billeteApi.qr);
  });

  it("no se rompe con un QR que no se puede leer", () => {
    const b = billeteDeApi({ ...billeteApi, qr: "roto" });
    expect(b.pasajero).toMatchObject({ nombre: "", documento: "" });
    expect(datosDeQr("RNF1.###.firma")).toEqual({});
  });
});

describe("claseDeApi y asientoDeApi", () => {
  it("traduce las clases visibles de la API", () => {
    expect(claseDeApi("Turista")).toBe("Estándar");
    expect(claseDeApi("Confort")).toBe("Confort");
    expect(claseDeApi("cualquiera")).toBe("Estándar");
    expect(asientoDeApi("7D", 2, "Confort", 30)).toMatchObject({ coche: 2, fila: 7, letra: "D", precio: 30 });
  });
});

describe("validacionDeApi", () => {
  const base: ResultadoValidacionApi = {
    estado: "ya_validado",
    billete: {
      id: "1c4a",
      localizador: "R-7K3M9Q",
      pasajero: "Lucía Pérez Gómez",
      documento: "••••678Z",
      tipo: "AVE",
      numero: "02070",
      salida: billeteApi.salida,
      llegada: billeteApi.llegada,
      origen: "Madrid-Puerta de Atocha",
      destino: "Zaragoza-Delicias",
      coche: 3,
      asiento: "12A",
      clase: "Turista",
    },
    validadoEn: "2026-11-02T07:20:11+01:00",
    primeraValidacion: "2026-11-02T07:20:11+01:00",
    comprobadoEnServidor: true,
  };

  it("convierte primeraValidacion null en undefined", () => {
    expect(validacionDeApi({ ...base, primeraValidacion: null }).primeraValidacion).toBeUndefined();
    expect(validacionDeApi(base).primeraValidacion).toBe("2026-11-02T07:20:11+01:00");
    expect(validacionDeApi(base).estado).toBe("ya_validado");
  });
});
