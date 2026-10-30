/**
 * Calcula el trazado por las vías entre cada par de estaciones seguidas de los viajes sin
 * `shapes.txt` y lo guarda en `tramos_via` (ver `gtfs/vias.ts`). Se lanza tras importar el feed.
 *
 *   pnpm gtfs:vias                     # descarga la red de OSM (una vez, se guarda en data/) y calcula
 *   pnpm gtfs:vias --osm data/vias.json  # usa una red ya descargada
 *   pnpm gtfs:vias --todos             # recalcula también los tramos que ya existen
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { abrir, cerrar, consultar } from "./bd.js";
import { cargarEnv, variable } from "./entorno.js";
import { construirGrafo, trazado, type Osm } from "./gtfs/vias.js";

const DIR_DATOS = join(dirname(fileURLToPath(import.meta.url)), "..", "data");
// Por caja (península + Baleares + frontera) y no por `area`: el área «España» de algunos espejos de
// Overpass está incompleta y deja fuera regiones enteras (p. ej. Tarragona).
const CONSULTA_OSM =
  '[out:json][timeout:800][maxsize:1073741824];' +
  'way["railway"="rail"]["service"!~"yard|siding|spur|crossover"](35.8,-9.6,43.9,4.5);out body;>;out skel qt;';
// El servidor principal suele ir saturado: se prueban espejos públicos en orden.
const SERVIDORES = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

// Pares de estaciones seguidas en viajes que no tienen forma propia, con sus coordenadas.
const SQL_PARES = `
  with seguidas as (
    select h.estacion_id as origen_id,
           lead(h.estacion_id) over (partition by h.feed, h.viaje_id order by h.secuencia) as destino_id
      from horarios h
      join viajes v on v.feed = h.feed and v.id = h.viaje_id
     where v.forma_id is null
  )
  select distinct s.origen_id, s.destino_id, eo.lat as olat, eo.lon as olon, ed.lat as dlat, ed.lon as dlon
    from seguidas s
    join estaciones eo on eo.id = s.origen_id
    join estaciones ed on ed.id = s.destino_id
   where s.destino_id is not null and s.origen_id <> s.destino_id
`;

interface Par {
  origen_id: string;
  destino_id: string;
  olat: number;
  olon: number;
  dlat: number;
  dlon: number;
}

async function obtenerOsm(ruta: string | null): Promise<Osm> {
  const fichero = ruta ?? join(DIR_DATOS, "vias-osm.json");
  if (existsSync(fichero)) {
    console.log(`· Leyendo ${fichero}`);
    return JSON.parse(readFileSync(fichero, "utf8")) as Osm;
  }
  for (const servidor of SERVIDORES) {
    console.log(`· Descargando la red ferroviaria de OSM de ${servidor} (puede tardar un par de minutos)…`);
    try {
      const r = await fetch(servidor, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "renfe-app/0.1 (proyecto de clase)" },
        body: new URLSearchParams({ data: CONSULTA_OSM }),
      });
      const texto = await r.text();
      if (!r.ok || !texto.startsWith("{")) throw new Error(`HTTP ${r.status}`);
      mkdirSync(DIR_DATOS, { recursive: true });
      writeFileSync(fichero, texto);
      return JSON.parse(texto) as Osm;
    } catch (e) {
      console.log(`  ${(e as Error).message}: probando el siguiente`);
    }
  }
  throw new Error("No se pudo descargar la red de OSM de ningún servidor de Overpass");
}

async function principal(): Promise<void> {
  cargarEnv();
  const args = process.argv.slice(2);
  const osm = await obtenerOsm(args.includes("--osm") ? args[args.indexOf("--osm") + 1]! : null);
  console.log("· Construyendo el grafo de vías…");
  const grafo = construirGrafo(osm);
  console.log(`  ${grafo.vecinos.size} nodos con vía`);

  const conexion = await abrir(variable("DATABASE_URL"));
  try {
    const hechos = args.includes("--todos")
      ? new Set<string>()
      : new Set((await consultar<{ c: string }>(conexion, "select origen_id || '|' || destino_id as c from tramos_via")).map((f) => f.c));
    const pares = (await consultar<Par>(conexion, SQL_PARES)).filter((p) => !hechos.has(`${p.origen_id}|${p.destino_id}`));
    console.log(`· ${pares.length} tramos por calcular`);

    let bien = 0;
    const lote: object[] = [];
    const guardar = async () => {
      if (!lote.length) return;
      await conexion.cliente.query(
        `insert into public.tramos_via (origen_id, destino_id, puntos, metros)
         select origen_id, destino_id, puntos, metros
           from jsonb_to_recordset($1::jsonb) as x(origen_id text, destino_id text, puntos jsonb, metros integer)
         on conflict (origen_id, destino_id) do update
           set puntos = excluded.puntos, metros = excluded.metros, actualizado_en = now()`,
        [JSON.stringify(lote.splice(0))],
      );
    };
    for (const [i, p] of pares.entries()) {
      const t = trazado(grafo, [p.olat, p.olon], [p.dlat, p.dlon]);
      if (t) {
        bien += 1;
        lote.push({ origen_id: p.origen_id, destino_id: p.destino_id, puntos: t.puntos, metros: t.metros });
      }
      if (lote.length >= 200) await guardar();
      if ((i + 1) % 250 === 0) console.log(`  ${i + 1}/${pares.length}`);
    }
    await guardar();
    console.log(`\n✔ ${bien} de ${pares.length} tramos trazados por las vías (el resto sigue en línea recta)\n`);
  } finally {
    await cerrar(conexion);
  }
}

principal().catch((e: unknown) => {
  console.error(`\n✖ ${(e as Error).message}\n`);
  process.exit(1);
});
