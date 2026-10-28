#!/usr/bin/env node
/**
 * Comprueba el catálogo cargado: conteos frente al feed medido el 28/10, huérfanos
 * y una consulta real de la API.
 *
 *   pnpm gtfs:verificar
 *   pnpm gtfs:verificar --feed avld
 *
 * Sale con código 1 si algo está roto de verdad (huérfanos o conteos muy lejos de
 * lo esperado). Los avisos que solo indican «el feed ha cambiado» no fallan.
 */
import { abrir, cerrar, consultar, type Conexion } from "./bd.js";
import { cargarEnv, variable } from "./entorno.js";
import { FEED } from "./gtfs/avld.js";
import { hoyEnMadrid } from "./gtfs/tiempo.js";

/**
 * Filas medidas en el feed de AV/LD/MD el **28/10/2026** (contrato §8).
 * Renfe republica a diario: se admite una variación del 10 % sin avisar.
 */
const ESPERADO: Record<string, { tabla: string; columna?: string; filas: number }> = {
  estaciones: { tabla: "estaciones", filas: 1_035 },
  estacion_feeds: { tabla: "estacion_feeds", columna: "feed", filas: 1_008 },
  rutas: { tabla: "rutas", columna: "feed", filas: 663 },
  calendarios: { tabla: "calendarios", columna: "feed", filas: 8_729 },
  calendario_excepciones: { tabla: "calendario_excepciones", columna: "feed", filas: 31_702 },
  viajes: { tabla: "viajes", columna: "feed", filas: 8_729 },
  horarios: { tabla: "horarios", columna: "feed", filas: 69_670 },
};

const TOLERANCIA = 0.1;

/**
 * La misma condición que `SERVICIO_ACTIVO` de la API
 * (`backend/api/src/common/gtfs/sql.ts`). Se copia aquí a propósito para que la
 * verificación falle si el catálogo no encaja con la consulta que usa la API.
 */
const SERVICIO_ACTIVO = `
  (
    exists (select 1 from calendario_excepciones x
             where x.feed = v.feed and x.servicio_id = v.servicio_id
               and x.fecha = $2::date and x.tipo = 'añadido')
    or (
      not exists (select 1 from calendario_excepciones x
                   where x.feed = v.feed and x.servicio_id = v.servicio_id
                     and x.fecha = $2::date and x.tipo = 'eliminado')
      and exists (select 1 from calendarios c
                   where c.feed = v.feed and c.id = v.servicio_id
                     and $2::date between c.inicio and c.fin
                     and case extract(isodow from $2::date)
                           when 1 then c.lunes when 2 then c.martes when 3 then c.miercoles
                           when 4 then c.jueves when 5 then c.viernes when 6 then c.sabado
                           else c.domingo end)
    )
  )`;

let fallos = 0;

async function principal(): Promise<void> {
  cargarEnv();
  const argumentos = process.argv.slice(2);
  const indiceFeed = argumentos.indexOf("--feed");
  const feed = indiceFeed >= 0 ? (argumentos[indiceFeed + 1] ?? FEED) : FEED;

  const conexion = await abrir(variable("DATABASE_URL"));
  try {
    console.log(`\n▶ Verificación del catálogo «${feed}» · ${hoyEnMadrid()}\n`);
    await contar(conexion, feed);
    await comprobarIntegridad(conexion, feed);
    await comprobarConsultaDeLaApi(conexion, feed);
  } finally {
    await cerrar(conexion);
  }

  if (fallos > 0) {
    console.log(`\n✖ ${fallos} comprobación(es) en rojo.\n`);
    process.exitCode = 1;
    return;
  }
  console.log("\n✔ Todo en verde.\n");
}

async function contar(conexion: Conexion, feed: string): Promise<void> {
  console.log("  Conteos (esperado = feed del 28/10)");
  for (const [nombre, esperado] of Object.entries(ESPERADO)) {
    const donde = esperado.columna === undefined ? "" : ` where ${esperado.columna} = $1`;
    const valores = esperado.columna === undefined ? [] : [feed];
    const [fila] = await consultar<{ n: string }>(
      conexion,
      `select count(*)::text as n from public.${esperado.tabla}${donde}`,
      valores,
    );
    const real = Number(fila?.n ?? "0");
    const desviacion = esperado.filas === 0 ? 0 : (real - esperado.filas) / esperado.filas;
    const estado = Math.abs(desviacion) <= 0.0001 ? "ok" : Math.abs(desviacion) <= TOLERANCIA ? "~" : "!";
    if (estado === "!") fallos += 1;
    console.log(
      `    ${estado}  ${nombre.padEnd(24)}${String(real).padStart(8)}` +
        `   esperado ${String(esperado.filas).padStart(7)}` +
        `   ${(desviacion * 100).toFixed(1).padStart(6)} %`,
    );
  }
  console.log("       (ok = exacto · ~ = dentro del 10 % · ! = fuera de rango)\n");
}

async function comprobarIntegridad(
  conexion: Conexion,
  feed: string,
): Promise<void> {
  console.log("  Integridad");

  const comprobaciones: Array<{ nombre: string; sql: string; debeSerCero?: boolean }> = [
    {
      nombre: "horarios sin viaje",
      sql: "select count(*)::text as n from horarios h left join viajes v on v.feed = h.feed and v.id = h.viaje_id where h.feed = $1 and v.id is null",
      debeSerCero: true,
    },
    {
      nombre: "viajes sin horarios",
      sql: "select count(*)::text as n from viajes v where v.feed = $1 and not exists (select 1 from horarios h where h.feed = v.feed and h.viaje_id = v.id)",
      debeSerCero: true,
    },
    {
      nombre: "viajes con origen = destino",
      sql: "select count(*)::text as n from viajes where feed = $1 and origen_id = destino_id",
      debeSerCero: true,
    },
    {
      nombre: "viajes con salida > llegada",
      sql: "select count(*)::text as n from viajes where feed = $1 and salida > llegada",
      debeSerCero: true,
    },
    {
      nombre: "viajes caducados (fecha_fin < hoy)",
      sql: "select count(*)::text as n from viajes where feed = $1 and fecha_fin < current_date",
    },
    {
      nombre: "viajes sin fecha_inicio/fin de su calendario",
      sql: "select count(*)::text as n from viajes v join calendarios c on c.feed = v.feed and c.id = v.servicio_id where v.feed = $1 and (v.fecha_inicio <> c.inicio or v.fecha_fin <> c.fin)",
      debeSerCero: true,
    },
    {
      nombre: "rutas sin viajes",
      sql: "select count(*)::text as n from rutas r where r.feed = $1 and not exists (select 1 from viajes v where v.feed = r.feed and v.ruta_id = r.id)",
    },
    {
      nombre: "rutas en tipo «otro»",
      sql: "select count(*)::text as n from rutas where feed = $1 and tipo_servicio = 'otro'",
      debeSerCero: true,
    },
    {
      nombre: "viajes sin número de tren",
      sql: "select count(*)::text as n from viajes where feed = $1 and numero is null",
    },
  ];

  for (const comprobacion of comprobaciones) {
    const [fila] = await consultar<{ n: string }>(conexion, comprobacion.sql, [feed]);
    const valor = Number(fila?.n ?? "0");
    const falla = comprobacion.debeSerCero === true && valor !== 0;
    if (falla) fallos += 1;
    console.log(`    ${falla ? "!" : "ok"}  ${comprobacion.nombre.padEnd(40)}${String(valor).padStart(7)}`);
  }

  const [porTipo] = await consultar<{ tipos: string | null }>(
    conexion,
    "select string_agg(tipo_servicio || '=' || n, ' · ' order by n desc) as tipos from (select tipo_servicio, count(*)::text as n from rutas where feed = $1 group by tipo_servicio) t",
    [feed],
  );
  console.log(`\n    tipos de servicio: ${porTipo?.tipos ?? "(sin rutas)"}\n`);
}

async function comprobarConsultaDeLaApi(
  conexion: Conexion,
  feed: string,
): Promise<void> {
  const fecha = hoyEnMadrid();
  console.log(`  Consulta de la API para hoy (${fecha})`);

  const [total] = await consultar<{ n: string }>(
    conexion,
    `select count(*)::text as n from viajes v where v.feed = $1 and ${SERVICIO_ACTIVO}`,
    [feed, fecha],
  );
  const cuantos = Number(total?.n ?? "0");
  if (cuantos === 0) fallos += 1;
  console.log(`    ${cuantos === 0 ? "!" : "ok"}  viajes que circulan hoy: ${cuantos}`);

  const ejemplos = await consultar<{
    linea: string | null;
    numero: string | null;
    origen: string;
    destino: string;
    salida: string;
    llegada: string;
  }>(
    conexion,
    `select r.nombre_corto as linea,
            v.numero,
            eo.nombre as origen,
            ed.nombre as destino,
            v.salida::text as salida,
            v.llegada::text as llegada
       from viajes v
       join rutas r on r.feed = v.feed and r.id = v.ruta_id
       join estaciones eo on eo.id = v.origen_id
       join estaciones ed on ed.id = v.destino_id
      where v.feed = $1 and ${SERVICIO_ACTIVO}
      order by v.salida
      limit 3`,
    [feed, fecha],
  );

  if (ejemplos.length === 0) {
    console.log("    !  la consulta no devuelve viajes: revisa el calendario y las excepciones");
    fallos += 1;
  } else {
    for (const ejemplo of ejemplos) {
      const linea = `${ejemplo.linea ?? ""} ${ejemplo.numero ?? ""}`.trim();
      console.log(
        `    ok  ${linea.padEnd(14)} ${ejemplo.origen} → ${ejemplo.destino}` +
          `  ${ejemplo.salida.slice(0, 5)}–${ejemplo.llegada.slice(0, 5)}`,
      );
    }
  }
  console.log();
}

principal().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`\n✖ ${mensaje}\n`);
  process.exitCode = 1;
});
