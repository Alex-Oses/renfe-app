/**
 * Lectura y transformación del feed GTFS de **AVE/Larga Distancia/Media
 * Distancia** (`google_transit.zip`) al modelo del contrato (§4.1–§4.7).
 *
 * El feed **ya viene expandido por fecha**: un `trip_id` es un viaje de un día
 * concreto (lleva la fecha dentro, `0019012026-10-28`) y su `service_id` apunta
 * a un calendario de uno o varios días. Por eso `viajes` lleva `fecha_inicio` y
 * `fecha_fin`, y las columnas resumen se calculan aquí, una sola vez.
 */
import { registrosCsv } from "../csv.js";
import { descomprimirZip } from "../zip.js";
import { leerEstacionesCsv, type FilaEstacion } from "./estaciones.js";
import { booleanoGtfs, fechaGtfs, horaGtfs, permiteGtfs } from "./tiempo.js";
import { tipoServicio } from "./tipo-servicio.js";

export interface FilaEstacionFeed {
  estacion_id: string;
  feed: string;
  stop_id: string;
  anden: string | null;
}

export interface FilaRuta {
  feed: string;
  id: string;
  nombre: string;
  nombre_corto: string | null;
  tipo_servicio: string;
  color: string | null;
}

export interface FilaCalendario {
  feed: string;
  id: string;
  lunes: boolean;
  martes: boolean;
  miercoles: boolean;
  jueves: boolean;
  viernes: boolean;
  sabado: boolean;
  domingo: boolean;
  inicio: string;
  fin: string;
}

export interface FilaExcepcion {
  feed: string;
  servicio_id: string;
  fecha: string;
  tipo: "añadido" | "eliminado";
}

export interface FilaViaje {
  feed: string;
  id: string;
  numero: string | null;
  ruta_id: string;
  servicio_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  origen_id: string;
  destino_id: string;
  salida: string;
  llegada: string;
  num_paradas: number;
  sentido: number | null;
  accesible: boolean | null;
}

export interface FilaHorario {
  feed: string;
  viaje_id: string;
  secuencia: number;
  estacion_id: string;
  llega: string | null;
  sale: string | null;
  recoge: boolean;
  deja: boolean;
}

export interface Informe {
  /** Filas leídas de cada fichero del zip, para comparar con el feed esperado. */
  ficheros: Record<string, number>;
  estacionesCsv: number;
  estacionesCsvDescartadas: Array<{ codigo: string; motivo: string }>;
  paradas: number;
  paradasSinCodigo: number;
  rutasPorTipo: Record<string, number>;
  viajesSinParadas: number;
  viajesSinHoras: number;
  viajesSinOrigen: number;
  viajesSinDestino: number;
  excepcionesHuerfanas: number;
  horariosHuerfanos: number;
  avisos: string[];
}

export interface Catalogo {
  estaciones: FilaEstacion[];
  estacionFeeds: FilaEstacionFeed[];
  rutas: FilaRuta[];
  calendarios: FilaCalendario[];
  excepciones: FilaExcepcion[];
  viajes: FilaViaje[];
  horarios: FilaHorario[];
  informe: Informe;
}

/** Nombre del feed en la base de datos (`viajes.feed`, `rutas.feed`…). */
export const FEED = "avld";

export function leerCatalogo(zip: Buffer, estacionesCsv: Buffer, feed: string = FEED): Catalogo {
  const ficheros = descomprimirZip(zip);
  const avisos: string[] = [];

  const texto = (nombre: string): string => {
    const contenido = ficheros.get(nombre);
    if (contenido === undefined) {
      throw new Error(`El feed no contiene «${nombre}». ¿Es el zip de AV/LD/MD?`);
    }
    return contenido.toString("utf8");
  };

  // --- estaciones.csv: fuente canónica del id de estación -------------------
  const delCsv = leerEstacionesCsv(estacionesCsv);
  const estaciones = new Map<string, FilaEstacion>();
  for (const estacion of delCsv.estaciones) estaciones.set(estacion.id, estacion);

  // --- stops.txt: qué stop_id es cada estación ------------------------------
  const estacionFeeds: FilaEstacionFeed[] = [];
  const estacionDeStop = new Map<string, string>();
  let paradas = 0;
  let paradasSinCodigo = 0;

  for (const parada of registrosCsv(texto("stops.txt"))) {
    const stopId = (parada["stop_id"] ?? "").trim();
    if (stopId === "") continue;
    paradas += 1;

    // El `stop_id` de AV/LD/MD es el CODIGO del CSV: 1 008 de 1 008 medidos el 28/10.
    let estacionId = stopId;
    const existente = estaciones.get(stopId);
    const accesible = booleanoGtfs(parada["wheelchair_boarding"]);

    if (existente === undefined) {
      paradasSinCodigo += 1;
      estacionId = `${feed}:${stopId}`;
      const lat = Number((parada["stop_lat"] ?? "").trim());
      const lon = Number((parada["stop_lon"] ?? "").trim());
      // `estaciones.lat/lon` son `not null`: si la parada no trae coordenada válida no se
      // inventa una estación (sus horarios se cuentan como huérfanos y salen en el informe).
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
        avisos.push(`Parada ${stopId} sin CODIGO ni coordenadas válidas: se descarta`);
        continue;
      }
      estaciones.set(estacionId, {
        id: estacionId,
        nombre: (parada["stop_name"] ?? "").trim() || stopId,
        ciudad: null,
        provincia: null,
        lat,
        lon,
        accesible,
      });
      avisos.push(`Parada ${stopId} sin CODIGO en estaciones.csv: entra como ${estacionId}`);
    } else if (accesible !== null && existente.accesible === null) {
      existente.accesible = accesible;
    }

    estacionDeStop.set(stopId, estacionId);
    estacionFeeds.push({
      estacion_id: estacionId,
      feed,
      stop_id: stopId,
      anden: (parada["platform_code"] ?? "").trim() || null,
    });
  }

  // --- routes.txt -----------------------------------------------------------
  const rutas: FilaRuta[] = [];
  const rutasPorTipo: Record<string, number> = {};
  for (const ruta of registrosCsv(texto("routes.txt"))) {
    const id = (ruta["route_id"] ?? "").trim();
    if (id === "") continue;
    const nombreLargo = (ruta["route_long_name"] ?? "").trim();
    const nombreCorto = (ruta["route_short_name"] ?? "").trim();
    const tipo = tipoServicio(feed, nombreCorto, nombreLargo);
    rutasPorTipo[tipo] = (rutasPorTipo[tipo] ?? 0) + 1;
    rutas.push({
      feed,
      id,
      // Regla de importación (contrato §4.3): nunca `null`, para que la API no
      // reciba `null` donde espera `string`. En AV/LD/MD acaba siendo el producto.
      nombre: nombreLargo || nombreCorto,
      nombre_corto: nombreCorto || null,
      tipo_servicio: tipo,
      color: normalizarColor(ruta["route_color"]),
    });
  }

  // --- calendar.txt ---------------------------------------------------------
  const calendarios: FilaCalendario[] = [];
  const calendarioPorId = new Map<string, FilaCalendario>();
  for (const calendario of registrosCsv(texto("calendar.txt"))) {
    const id = (calendario["service_id"] ?? "").trim();
    if (id === "") continue;
    const fila: FilaCalendario = {
      feed,
      id,
      lunes: esSi(calendario["monday"]),
      martes: esSi(calendario["tuesday"]),
      miercoles: esSi(calendario["wednesday"]),
      jueves: esSi(calendario["thursday"]),
      viernes: esSi(calendario["friday"]),
      sabado: esSi(calendario["saturday"]),
      domingo: esSi(calendario["sunday"]),
      inicio: fechaGtfs(calendario["start_date"] ?? ""),
      fin: fechaGtfs(calendario["end_date"] ?? ""),
    };
    calendarios.push(fila);
    calendarioPorId.set(id, fila);
  }

  // --- calendar_dates.txt (opcional: Cercanías no lo publica) ---------------
  const excepciones: FilaExcepcion[] = [];
  let excepcionesHuerfanas = 0;
  for (const excepcion of registrosCsv(texto("calendar_dates.txt"))) {
    const servicioId = (excepcion["service_id"] ?? "").trim();
    if (servicioId === "") continue;
    if (!calendarioPorId.has(servicioId)) {
      excepcionesHuerfanas += 1;
      continue;
    }
    const tipo = (excepcion["exception_type"] ?? "").trim();
    if (tipo !== "1" && tipo !== "2") {
      avisos.push(`exception_type desconocido (${tipo}) para ${servicioId}`);
      continue;
    }
    excepciones.push({
      feed,
      servicio_id: servicioId,
      fecha: fechaGtfs(excepcion["date"] ?? ""),
      tipo: tipo === "1" ? "añadido" : "eliminado",
    });
  }

  // --- stop_times.txt ------------------------------------------------------
  const horarios: FilaHorario[] = [];
  const paradasPorViaje = new Map<string, FilaHorario[]>();
  let horariosHuerfanos = 0;

  for (const parada of registrosCsv(texto("stop_times.txt"))) {
    const viajeId = (parada["trip_id"] ?? "").trim();
    const stopId = (parada["stop_id"] ?? "").trim();
    if (viajeId === "" || stopId === "") continue;
    const estacionId = estacionDeStop.get(stopId);
    if (estacionId === undefined) {
      horariosHuerfanos += 1;
      continue;
    }
    const fila: FilaHorario = {
      feed,
      viaje_id: viajeId,
      secuencia: Number((parada["stop_sequence"] ?? "").trim()),
      estacion_id: estacionId,
      llega: horaGtfs(parada["arrival_time"] ?? ""),
      sale: horaGtfs(parada["departure_time"] ?? ""),
      // Cercanías no publica estas columnas: `permiteGtfs` devuelve `true` si faltan.
      recoge: permiteGtfs(parada["pickup_type"]),
      deja: permiteGtfs(parada["drop_off_type"]),
    };
    horarios.push(fila);
    const delViaje = paradasPorViaje.get(viajeId);
    if (delViaje === undefined) paradasPorViaje.set(viajeId, [fila]);
    else delViaje.push(fila);
  }

  // --- trips.txt (necesita el resumen de stop_times y el calendario) --------
  const viajes: FilaViaje[] = [];
  let viajesSinParadas = 0;
  let viajesSinHoras = 0;
  let viajesSinOrigen = 0;
  let viajesSinDestino = 0;

  for (const viaje of registrosCsv(texto("trips.txt"))) {
    const id = (viaje["trip_id"] ?? "").trim();
    const rutaId = (viaje["route_id"] ?? "").trim();
    const servicioId = (viaje["service_id"] ?? "").trim();
    if (id === "" || rutaId === "" || servicioId === "") continue;

    const calendario = calendarioPorId.get(servicioId);
    if (calendario === undefined) {
      avisos.push(`Viaje ${id} con service_id ${servicioId} que no está en calendar.txt`);
      continue;
    }

    const paradasDelViaje = paradasPorViaje.get(id);
    if (paradasDelViaje === undefined || paradasDelViaje.length === 0) {
      viajesSinParadas += 1;
      continue;
    }
    const ordenadas = [...paradasDelViaje].sort((a, b) => a.secuencia - b.secuencia);

    const origen = ordenadas.find((parada) => parada.recoge);
    const destino = [...ordenadas].reverse().find((parada) => parada.deja);
    if (origen === undefined) viajesSinOrigen += 1;
    if (destino === undefined) viajesSinDestino += 1;
    const desde = origen ?? ordenadas[0];
    const hasta = destino ?? ordenadas[ordenadas.length - 1];
    if (desde === undefined || hasta === undefined) {
      viajesSinParadas += 1;
      continue;
    }

    const salida = desde.sale ?? desde.llega;
    const llegada = hasta.llega ?? hasta.sale;
    if (salida === null || llegada === null) {
      viajesSinHoras += 1;
      continue;
    }

    viajes.push({
      feed,
      id,
      numero: (viaje["trip_short_name"] ?? "").trim() || null,
      ruta_id: rutaId,
      servicio_id: servicioId,
      fecha_inicio: calendario.inicio,
      fecha_fin: calendario.fin,
      origen_id: desde.estacion_id,
      destino_id: hasta.estacion_id,
      salida,
      llegada,
      num_paradas: ordenadas.length,
      sentido: sentidoGtfs(viaje["direction_id"]),
      accesible: booleanoGtfs(viaje["wheelchair_accessible"]),
    });
  }

  if (viajesSinOrigen > 0) {
    avisos.push(`${viajesSinOrigen} viaje(s) sin parada con recoge: se usa la primera parada`);
  }
  if (viajesSinDestino > 0) {
    avisos.push(`${viajesSinDestino} viaje(s) sin parada con deja: se usa la última parada`);
  }

  const rutasConocidas = new Set(rutas.map((ruta) => ruta.id));
  const huerfanas = viajes.filter((viaje) => !rutasConocidas.has(viaje.ruta_id)).length;
  if (huerfanas > 0) {
    avisos.push(`${huerfanas} viaje(s) apuntan a una ruta que no está en routes.txt`);
  }

  return {
    estaciones: [...estaciones.values()],
    estacionFeeds,
    rutas,
    calendarios,
    excepciones,
    viajes,
    horarios,
    informe: {
      ficheros: {
        "routes.txt": rutas.length,
        "stops.txt": paradas,
        "trips.txt": viajes.length,
        "stop_times.txt": horarios.length,
        "calendar.txt": calendarios.length,
        "calendar_dates.txt": excepciones.length,
      },
      estacionesCsv: delCsv.estaciones.length,
      estacionesCsvDescartadas: delCsv.descartadas,
      paradas,
      paradasSinCodigo,
      rutasPorTipo,
      viajesSinParadas,
      viajesSinHoras,
      viajesSinOrigen,
      viajesSinDestino,
      excepcionesHuerfanas,
      horariosHuerfanos,
      avisos,
    },
  };
}

function esSi(valor: string | undefined): boolean {
  return (valor ?? "").trim() === "1";
}

function sentidoGtfs(valor: string | undefined): number | null {
  const limpio = (valor ?? "").trim();
  return limpio === "0" || limpio === "1" ? Number(limpio) : null;
}

/** `route_color` en hexadecimal de 6 dígitos; cualquier otra cosa se descarta. */
function normalizarColor(valor: string | undefined): string | null {
  const limpio = (valor ?? "").trim().toUpperCase().replace(/^#/, "");
  return /^[0-9A-F]{6}$/.test(limpio) ? limpio : null;
}
