// Adapta las respuestas del contrato (obsidian/02-contratos-api/endpoints.md) a lo que pinta la web.
// La API manda `tipo` en mayúsculas y `numero` puede ser null; la UI trabaja con TipoTren y textos.
import type {
  ParadaApi,
  ParadaRuta,
  ParadaViaje,
  TipoTren,
  Tren,
  TrenApi,
  TrenDetalle,
  TrenDetalleApi,
} from "./tipos";

// rutas.tipo_servicio (AVE, ALVIA, AVANT, MD…) → producto de la UI. Lo que no se reconoce se
// resuelve por el feed: es lo que ya hace el mapa con las posiciones (tipoDeFeed en cliente.ts).
const SERVICIOS: [RegExp, TipoTren][] = [
  [/^ave\b/i, "AVE"],
  [/^avlo\b/i, "Avlo"],
  [/^alvia\b/i, "Alvia"],
  [/^(intercity|ic)\b/i, "Intercity"],
  [/^(av|md|media\s*distancia|regional)/i, "Media Distancia"],
  [/^(cercanias|cercanías|rodalies)/i, "Cercanías"],
];

export const tipoDeServicio = (tipo?: string | null, feed?: string): TipoTren =>
  SERVICIOS.find(([re]) => re.test((tipo ?? "").trim()))?.[1] ?? (feed === "cercanias" ? "Cercanías" : "Larga Distancia");

// Si el número no viene, se saca del final de la línea ("AVE 02070" → "02070"). Ojo: el "4" de "C-4"
// no es un número de tren, es la línea, así que solo se toma si va detrás de un espacio.
export const numeroDeServicio = (numero?: string | null, linea?: string | null): string =>
  numero ?? linea?.match(/\s(\d+)\s*$/)?.[1] ?? "";

// Nombre corto para la UI: "AVE 02070", la línea ("C-4") o el tipo, que nunca queda vacío.
export const nombreDeTren = (t: Pick<Tren, "tipo" | "numero" | "linea">): string =>
  t.numero ? `${t.tipo} ${t.numero}` : (t.linea ?? t.tipo);

// El id de tren del contrato es "feed:tripId:fecha"; las rutas de viaje lo piden por partes.
// El mapa usa "feed:tripId" (sin fecha): se parte igual y la fecha se resuelve con hoy.
export function partirIdTren(id: string): { feed?: string; tripId?: string; fecha?: string } {
  const [feed, tripId, fecha] = id.split(":");
  return { feed, tripId, fecha: /^\d{4}-\d{2}-\d{2}$/.test(fecha ?? "") ? fecha : undefined };
}

// /posiciones manda a veces el nombre completo del servicio ("AVE 02070") en `nombre`; como la UI ya
// pinta el tipo aparte, se quita la primera palabra cuando es el producto, para no leer "AVE AVE 02070".
export function sinProducto(nombre: string, tipo: TipoTren): string {
  const partes = nombre.trim().split(/\s+/);
  if (partes.length < 2) return nombre.trim();
  const primera = partes[0].toLowerCase();
  const delTipo = tipo.toLowerCase().split(" ");
  if (primera === delTipo[0] || primera === delTipo.join("")) return partes.slice(1).join(" ");
  return nombre.trim();
}

export function aTren(t: TrenApi): Tren {
  return {
    id: t.id,
    tipo: tipoDeServicio(t.tipo, t.feed),
    numero: numeroDeServicio(t.numero, t.linea),
    origen: t.origen,
    destino: t.destino,
    feed: t.feed,
    tripId: t.tripId,
    fecha: t.fecha,
    linea: t.linea,
    numParadas: t.numParadas,
    duracionMin: t.duracionMin,
    retrasoSeg: t.retrasoSeg,
    salida: t.salida,
    llegada: t.llegada,
    precioDesde: t.precioDesde,
    plazasLibres: t.plazasLibres,
  };
}

export const aParada = (p: ParadaApi): ParadaViaje => ({
  seq: p.seq,
  estacionId: p.estacion.id,
  nombre: p.estacion.nombre,
  llega: p.llega,
  sale: p.sale,
  retrasoSeg: p.retrasoSeg,
});

export function aDetalleTren(d: TrenDetalleApi): TrenDetalle {
  return {
    id: `${d.feed}:${d.tripId}:${d.fecha}`,
    tipo: tipoDeServicio(d.tipo, d.feed),
    numero: numeroDeServicio(d.numero, d.linea),
    origen: d.origen,
    destino: d.destino,
    feed: d.feed,
    tripId: d.tripId,
    fecha: d.fecha,
    linea: d.linea,
    numParadas: d.paradas.length,
    duracionMin: Math.round((Date.parse(d.llegada) - Date.parse(d.salida)) / 60_000),
    retrasoSeg: d.retrasoSeg,
    salida: d.salida,
    llegada: d.llegada,
    // El detalle no habla de dinero: los precios son del viaje, no de esta ruta.
    precioDesde: 0,
    plazasLibres: 0,
    paradas: d.paradas.map(aParada),
    recorrido: d.recorrido ?? null,
  };
}

// El detalle trae el viaje entero: la reserva tiene que ser del tramo buscado (Madrid a Zaragoza en un tren a Barcelona).
export function soloTramo(t: TrenDetalle, origen?: string | null, destino?: string | null): TrenDetalle {
  const o = t.paradas.find((p) => p.estacionId === origen);
  const d = t.paradas.find((p) => p.estacionId === destino);
  if (!o || !d || o.seq >= d.seq) return t;
  const salida = o.sale ?? o.llega ?? t.salida;
  const llegada = d.llega ?? d.sale ?? t.llegada;
  return {
    ...t,
    origen: { id: o.estacionId, nombre: o.nombre },
    destino: { id: d.estacionId, nombre: d.nombre },
    salida,
    llegada,
    duracionMin: Math.round((Date.parse(llegada) - Date.parse(salida)) / 60_000),
  };
}

// Hora prevista en una parada: GTFS exige llegada o salida, así que se usa la que haya.
export const horaDeParada = (p: Pick<ParadaViaje, "llega" | "sale">): string | null => p.llega ?? p.sale;

// Las horas del GTFS estático vienen sin retraso. El contrato dice que las horas van con el retraso
// aplicado cuando se conoce; como el detalle solo lee el estático, el retraso de GTFS-RT se suma aquí.
export function desplazarHora(iso: string | null, retrasoSeg: number | null): string | null {
  if (iso === null) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t + (retrasoSeg ?? 0) * 1000).toISOString();
}

// Paradas del mapa: solo las que tienen coordenadas y hora, que son las que se pueden pintar.
// `pasada` sale de comparar la hora prevista (ya con retraso) con el reloj del navegador.
export function marcarParadas(paradas: ParadaViaje[], ahoraMs = Date.now()): ParadaRuta[] {
  const dibujables: ParadaRuta[] = [];
  for (const p of paradas) {
    const hora = horaDeParada(p);
    if (hora === null || p.lat === undefined || p.lon === undefined) continue;
    const t = Date.parse(hora);
    if (Number.isNaN(t)) continue;
    dibujables.push({
      estacionId: p.estacionId,
      nombre: p.nombre,
      lat: p.lat,
      lon: p.lon,
      llegada: hora,
      pasada: t <= ahoraMs,
    });
  }
  return dibujables;
}
