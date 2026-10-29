// Adapta reservas y billetes entre la API (obsidian/02-contratos-api/endpoints.md) y la UI.
// Diferencias que resuelve este fichero:
// - POST /reservas no recibe la butaca: la API asigna la primera libre, así que los asientos
//   elegidos en la web no viajan. La reserva que se pinta es la que devuelve la API.
// - GET /billetes devuelve un billete plano (coche y asiento como texto) y el viajero solo va
//   dentro del QR firmado; la UI trabaja con un Tren y un Pasajero.
import { numeroDeServicio, partirIdTren, tipoDeServicio } from "./adaptador-trenes";
import type {
  Asiento,
  Billete,
  BilleteApi,
  BilleteEmitidoApi,
  ClaseAsiento,
  NuevaReserva,
  NuevaReservaApi,
  Pasajero,
  PasajeroApi,
  Reserva,
  ReservaApi,
  ResultadoValidacion,
  ResultadoValidacionApi,
  Tren,
} from "./tipos";

// El contrato admite de 1 a 6 pasajeros por reserva (una butaca por pasajero).
export const MAX_PASAJEROS = 6;

const CLASES: Record<string, ClaseAsiento> = {
  turista: "Estándar",
  estándar: "Estándar",
  estandar: "Estándar",
  confort: "Confort",
  preferente: "Prémium",
  prémium: "Prémium",
  premium: "Prémium",
};

// claseVisible de la API devuelve "Turista" o "Confort"; Prémium solo lo usa el simulado.
export const claseDeApi = (clase: string): ClaseAsiento =>
  CLASES[clase.trim().toLowerCase()] ?? "Estándar";

const LETRAS = ["A", "B", "C", "D"] as const;

// La API manda el asiento como texto ("12A") y el coche aparte; la UI lo parte en fila y letra.
export function asientoDeApi(etiqueta: string, coche: number, clase: string, precio: number): Asiento {
  const partes = /^(\d+)\s*([A-Za-z])$/.exec(etiqueta.trim());
  const fila = partes ? Number(partes[1]) : 0;
  const letra = partes?.[2]?.toUpperCase();
  return {
    id: `${coche}-${etiqueta.trim()}`,
    coche,
    fila,
    letra: LETRAS.find((l) => l === letra) ?? "A",
    clase: claseDeApi(clase),
    libre: false,
    precio,
  };
}

// "Lucía Pérez Gómez" → nombre "Lucía" y apellidos "Pérez Gómez", que es como los pinta la web.
function partesNombre(completo: string): { nombre: string; apellidos: string } {
  const [nombre = "", ...resto] = completo.trim().split(/\s+/);
  return { nombre, apellidos: resto.join(" ") };
}

// Como la API: se guarda el documento entero y solo se enmascara al pintarlo.
const enmascararDocumento = (documento: string) => `••••${documento.trim().slice(-4)}`;

const base64url = (texto: string) => {
  const limpio = texto.replace(/-/g, "+").replace(/_/g, "/");
  const relleno = limpio.padEnd(limpio.length + ((4 - (limpio.length % 4)) % 4), "=");
  // El contenido del QR son los bytes UTF-8 del JSON: hay que decodificarlos como texto, no como latin1.
  return new TextDecoder().decode(Uint8Array.from(atob(relleno), (c) => c.charCodeAt(0)));
};

export interface DatosQr {
  id?: string;
  p?: string; // nombre del viajero
  doc?: string; // documento enmascarado
}

// El billete no repite el viajero en la BD: nombre y documento viajan dentro del QR firmado.
// Aquí solo se lee el contenido para pintarlo; la firma la comprueba el servidor (POST /billetes/validar).
export function datosDeQr(qr: string): DatosQr {
  const [, datos] = qr.split(".");
  if (!datos) return {};
  try {
    const leido = JSON.parse(base64url(datos)) as DatosQr;
    return leido && typeof leido === "object" ? leido : {};
  } catch {
    return {};
  }
}

const aPasajeroApi = (p: Pasajero): PasajeroApi => ({
  nombre: `${p.nombre} ${p.apellidos}`.trim(),
  documento: p.documento.trim(),
});

// POST /reservas: el tren ya dice feed, tripId, fecha, origen y destino; los asientos no se mandan.
export function cuerpoReserva(tren: Tren, datos: NuevaReserva): NuevaReservaApi {
  const { feed, tripId, fecha } = partirIdTren(tren.id);
  if (!feed || !tripId || !fecha) {
    throw new Error("El viaje no trae feed, identificador y fecha: no se puede reservar.");
  }
  if (datos.pasajeros.length < 1 || datos.pasajeros.length > MAX_PASAJEROS) {
    throw new Error(`Solo se pueden reservar de 1 a ${MAX_PASAJEROS} plazas en una reserva.`);
  }
  return {
    feed: feed as NuevaReservaApi["feed"],
    viajeId: tripId,
    fecha,
    origenId: tren.origen.id,
    destinoId: tren.destino.id,
    pasajeros: datos.pasajeros.map(aPasajeroApi),
  };
}

const asientoEmitido = (b: BilleteEmitidoApi): Asiento =>
  asientoDeApi(b.asiento, b.coche, b.clase, b.precio);

// La API numera los billetes en el mismo orden que los pasajeros del request.
export function reservaDeApi(creada: ReservaApi, tren: Tren, datos: NuevaReserva): Reserva {
  return {
    id: creada.id,
    localizador: creada.localizador,
    tren,
    asientos: creada.billetes.map(asientoEmitido),
    pasajeros: datos.pasajeros.map((p) => ({ ...p, documento: enmascararDocumento(p.documento) })),
    total: creada.total,
    tarifa: datos.tarifa,
    descuento: datos.descuento,
    extras: datos.extras,
    bebes: datos.bebes,
    estado: creada.estado,
    creada: creada.creada,
  };
}

// GET /billetes: el viajero sale del QR (firmado por la API, solo se lee) y el localizador hace de
// nexo de la reserva, porque el contrato no manda su id: agrupar.ts junta los billetes por ahí.
export function billeteDeApi(api: BilleteApi): Billete {
  const qr = datosDeQr(api.qr);
  const { nombre, apellidos } = partesNombre(qr.p ?? "");
  return {
    id: api.id,
    reservaId: api.localizador,
    localizador: api.localizador,
    tren: {
      // /billetes no dice feed ni tripId: sin ellos el billete no enlaza al mapa.
      id: "",
      tipo: tipoDeServicio(api.tipo),
      numero: numeroDeServicio(api.numero),
      origen: api.origen,
      destino: api.destino,
      salida: api.salida,
      llegada: api.llegada,
      precioDesde: api.precio,
      plazasLibres: 0,
    },
    asiento: asientoDeApi(api.asiento, api.coche, api.clase, api.precio),
    pasajero: { nombre, apellidos, documento: qr.doc ?? "", email: "" },
    qr: api.qr,
  };
}

// POST /billetes/validar: la API manda `primeraValidacion: null`; la UI usa undefined.
export function validacionDeApi({
  primeraValidacion,
  ...resto
}: ResultadoValidacionApi): ResultadoValidacion {
  return { ...resto, primeraValidacion: primeraValidacion ?? undefined };
}
