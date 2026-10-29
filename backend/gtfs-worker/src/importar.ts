#!/usr/bin/env node
/**
 * Importa el catálogo GTFS de **AVE/Larga Distancia/Media Distancia** en la base
 * de datos del contrato (`estaciones`, `estacion_feeds`, `rutas`, `calendarios`,
 * `calendario_excepciones`, `viajes`, `horarios`).
 *
 * Uso (desde la raíz del repo):
 *
 *   pnpm gtfs:importar --simular        # descarga y analiza, sin tocar la BD
 *   pnpm gtfs:importar                  # carga en DATABASE_URL
 *   pnpm gtfs:importar --reemplazar     # vacía el feed `avld` antes de cargarlo
 *   pnpm gtfs:importar --zip data/avld.zip --estaciones data/estaciones.csv
 *
 * Todo va en **una transacción**: si algo falla, no queda nada a medias.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { abrir, cargar, cerrar, enTransaccion, vaciarFeed } from "./bd.js";
import { cargarEnv, variable } from "./entorno.js";
import { FEED, leerCatalogo, type Catalogo } from "./gtfs/avld.js";
import { hoyEnMadrid } from "./gtfs/tiempo.js";
import { ORDEN_CARGA, type TablaCarga } from "./sql.js";

const URL_AVLD = "https://ssl.renfe.com/gtransit/Fichero_AV_LD/google_transit.zip";
const URL_CERCANIAS = "https://ssl.renfe.com/ftransit/Fichero_CER_FOMENTO/fomento_transit.zip";
// Feed → [variable de entorno, URL por defecto]. Cercanías caduca a los 30 días: reimportar a diario.
const URLS_FEED: Record<string, [string, string]> = {
  avld: ["GTFS_AVLD_URL", URL_AVLD],
  cercanias: ["GTFS_CERCANIAS_URL", URL_CERCANIAS],
};
const URL_ESTACIONES = "https://ssl.renfe.com/ftransit/Fichero_estaciones/estaciones.csv";
const DIR_DATOS = join(dirname(fileURLToPath(import.meta.url)), "..", "data");

const AYUDA = `
Importa el catálogo GTFS de AV/LD/MD en la base de datos.

  pnpm gtfs:importar [opciones]

Opciones:
  --simular              descarga y analiza el feed, pero no toca la base de datos
  --reemplazar           vacía el feed antes de cargarlo
  --zip <ruta>           usa un zip ya descargado (no descarga nada)
  --estaciones <ruta>    usa un estaciones.csv ya descargado
  --feed <nombre>        feed: «avld» (por defecto) o «cercanias»
  --ayuda                esta ayuda

Variables de entorno (o .env en la raíz):
  DATABASE_URL           conexión a Postgres (obligatoria salvo con --simular)
  GTFS_AVLD_URL          URL del zip de AV/LD/MD (por defecto, la de Renfe)
  GTFS_CERCANIAS_URL     URL del zip de Cercanías (por defecto, la de Renfe)
  GTFS_ESTACIONES_URL    URL del CSV de estaciones (por defecto, la de Renfe)
`.trim();

interface Opciones {
  feed: string;
  zip: string | null;
  estaciones: string | null;
  simular: boolean;
  reemplazar: boolean;
}

async function principal(): Promise<void> {
  cargarEnv();
  const opciones = leerArgumentos(process.argv.slice(2));

  if (!(opciones.feed in URLS_FEED)) {
    throw new Error(`Feed desconocido «${opciones.feed}». Válidos: ${Object.keys(URLS_FEED).join(", ")}`);
  }

  console.log(`\n▶ GTFS ${opciones.feed} · ${hoyEnMadrid()}`);
  const zip = await obtenerZip(opciones.zip, opciones.feed);
  const estacionesCsv = await obtenerEstaciones(opciones.estaciones);

  console.log("· Analizando el feed…");
  const catalogo = leerCatalogo(zip, estacionesCsv, opciones.feed);
  imprimirInforme(catalogo);

  if (opciones.simular) {
    console.log("\n✔ Simulación terminada: no se ha tocado la base de datos.\n");
    return;
  }

  await cargarEnBaseDeDatos(catalogo, opciones.reemplazar, opciones.feed);
  console.log(`\n✔ Importación terminada. Comprueba con: pnpm gtfs:verificar\n`);
}

async function cargarEnBaseDeDatos(catalogo: Catalogo, reemplazar: boolean, feed: string): Promise<void> {
  const url = variable("DATABASE_URL");
  console.log(`\n· Conectando a ${ocultarCredenciales(url)}`);
  const conexion = await abrir(url);
  try {
    await enTransaccion(conexion, async () => {
      if (reemplazar) {
        console.log(`· Vaciando el feed «${feed}» (--reemplazar)…`);
        await vaciarFeed(conexion, feed);
      }

      const filas: Record<TablaCarga, object[]> = {
        estaciones: catalogo.estaciones,
        estacion_feeds: catalogo.estacionFeeds,
        rutas: catalogo.rutas,
        calendarios: catalogo.calendarios,
        calendario_excepciones: catalogo.excepciones,
        viajes: catalogo.viajes,
        horarios: catalogo.horarios,
      };

      for (const tabla of ORDEN_CARGA) {
        const inicio = Date.now();
        const total = await cargar(conexion, tabla, filas[tabla]);
        const segundos = ((Date.now() - inicio) / 1000).toFixed(1);
        console.log(`  ${tabla.padEnd(24)} ${String(total).padStart(7)} filas   ${segundos} s`);
      }
    });
  } finally {
    await cerrar(conexion);
  }
}

function imprimirInforme(catalogo: Catalogo): void {
  const { informe } = catalogo;
  console.log("\n  Ficheros del feed");
  for (const [nombre, filas] of Object.entries(informe.ficheros)) {
    console.log(`    ${nombre.padEnd(20)} ${String(filas).padStart(7)}`);
  }

  console.log("\n  Lo que se va a cargar");
  const linea = (nombre: string, cuantas: number, nota = ""): void =>
    console.log(`    ${nombre.padEnd(24)}${String(cuantas).padStart(7)}  ${nota}`);
  linea("estaciones", catalogo.estaciones.length, `(${informe.estacionesCsv} del CSV)`);
  linea("estacion_feeds", catalogo.estacionFeeds.length, `(${informe.paradasSinCodigo} paradas sin CODIGO)`);
  linea("rutas", catalogo.rutas.length);
  linea("calendarios", catalogo.calendarios.length);
  linea("calendario_excepciones", catalogo.excepciones.length);
  linea("viajes", catalogo.viajes.length);
  linea("horarios", catalogo.horarios.length);

  const tipos = Object.entries(informe.rutasPorTipo).sort((a, b) => b[1] - a[1]);
  console.log("\n  Rutas por tipo de servicio");
  for (const [tipo, cuantas] of tipos) console.log(`    ${tipo.padEnd(20)} ${String(cuantas).padStart(5)}`);

  const problemas: string[] = [];
  if (informe.viajesSinParadas > 0) problemas.push(`${informe.viajesSinParadas} viajes sin paradas`);
  if (informe.viajesSinHoras > 0) problemas.push(`${informe.viajesSinHoras} viajes sin horas de salida/llegada`);
  if (informe.excepcionesHuerfanas > 0) problemas.push(`${informe.excepcionesHuerfanas} excepciones de servicios desconocidos`);
  if (informe.horariosHuerfanos > 0) problemas.push(`${informe.horariosHuerfanos} paradas de viajes desconocidos`);
  if (informe.estacionesCsvDescartadas.length > 0) {
    problemas.push(`${informe.estacionesCsvDescartadas.length} filas del CSV descartadas`);
  }
  if (problemas.length > 0) {
    console.log("\n  Avisos");
    for (const problema of problemas) console.log(`    ! ${problema}`);
  }
  if (informe.avisos.length > 0) {
    console.log("\n  Detalle (primeros 10)");
    for (const aviso of informe.avisos.slice(0, 10)) console.log(`    · ${aviso}`);
    if (informe.avisos.length > 10) console.log(`    · … y ${informe.avisos.length - 10} más`);
  }
}

async function obtenerZip(ruta: string | null, feed: string): Promise<Buffer> {
  if (ruta !== null) {
    console.log(`· Leyendo ${ruta}`);
    return readFileSync(ruta);
  }
  const [clave, porDefecto] = URLS_FEED[feed]!;
  const url = variable(clave, porDefecto);
  console.log(`· Descargando ${url}`);
  const datos = await descargar(url);
  guardarEnDatos(`${feed}-${hoyEnMadrid()}.zip`, datos);
  return datos;
}

async function obtenerEstaciones(ruta: string | null): Promise<Buffer> {
  if (ruta !== null) {
    console.log(`· Leyendo ${ruta}`);
    return readFileSync(ruta);
  }
  const url = variable("GTFS_ESTACIONES_URL", URL_ESTACIONES);
  console.log(`· Descargando ${url}`);
  const datos = await descargar(url);
  guardarEnDatos(`estaciones-${hoyEnMadrid()}.csv`, datos);
  return datos;
}

async function descargar(url: string): Promise<Buffer> {
  const respuesta = await fetch(url, { signal: AbortSignal.timeout(180_000) });
  if (!respuesta.ok) {
    throw new Error(`La descarga falló: ${respuesta.status} ${respuesta.statusText} (${url})`);
  }
  const datos = Buffer.from(await respuesta.arrayBuffer());
  console.log(`  ${(datos.length / 1024 / 1024).toFixed(1)} MB`);
  return datos;
}

function guardarEnDatos(nombre: string, datos: Buffer): void {
  try {
    mkdirSync(DIR_DATOS, { recursive: true });
    const ruta = join(DIR_DATOS, nombre);
    writeFileSync(ruta, datos);
    console.log(`  guardado en ${ruta}`);
  } catch (error) {
    console.warn(`  aviso: no se pudo guardar en data/ (${String(error)})`);
  }
}

function leerArgumentos(argumentos: string[]): Opciones {
  const opciones: Opciones = {
    feed: FEED,
    zip: null,
    estaciones: null,
    simular: false,
    reemplazar: false,
  };

  for (let i = 0; i < argumentos.length; i += 1) {
    const argumento = argumentos[i] ?? "";
    switch (argumento) {
      case "--simular":
        opciones.simular = true;
        break;
      case "--reemplazar":
        opciones.reemplazar = true;
        break;
      case "--zip":
        i += 1;
        opciones.zip = siguiente(argumentos, i, "--zip");
        break;
      case "--estaciones":
        i += 1;
        opciones.estaciones = siguiente(argumentos, i, "--estaciones");
        break;
      case "--feed":
        i += 1;
        opciones.feed = siguiente(argumentos, i, "--feed");
        break;
      case "--ayuda":
      case "-h":
      case "--help":
        console.log(AYUDA);
        process.exit(0);
        break;
      default:
        throw new Error(`Opción desconocida: ${argumento}\n\n${AYUDA}`);
    }
  }
  return opciones;
}

function siguiente(argumentos: string[], indice: number, opcion: string): string {
  const valor = argumentos[indice];
  if (valor === undefined || valor.startsWith("--")) {
    throw new Error(`La opción ${opcion} necesita un valor`);
  }
  return valor;
}

function ocultarCredenciales(url: string): string {
  try {
    const partes = new URL(url);
    if (partes.password !== "") partes.password = "***";
    return partes.toString();
  } catch {
    return "(DATABASE_URL)";
  }
}

principal().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`\n✖ ${mensaje}\n`);
  process.exitCode = 1;
});
