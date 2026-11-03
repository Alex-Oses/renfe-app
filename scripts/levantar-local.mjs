#!/usr/bin/env node
// Levanta todo el stack en local con un solo comando (ver docs/levantar-en-local.md):
// Supabase (Docker, con las migraciones), `.env` con sus claves, catálogo GTFS real y la API en Docker.
// Uso: pnpm local [--sin-cercanias] [--sin-importar] [--solo-api]
//   --sin-cercanias  solo AV/LD/MD (Cercanías son ~2 M de horarios, ~2 min más)
//   --sin-importar   no vuelve a cargar los horarios (si la BD ya los tiene)
//   --solo-api       no levanta la web ni la app (lo que usa arrancar.cmd para la web de Vercel)

import { execSync, spawnSync } from "node:child_process";
import { generateKeyPairSync, randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const DB_URL = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
// La web de Vercel llama a esta API por Funnel: sin su origen en CORS, el navegador la rechaza.
const ORIGEN_VERCEL = "https://renfe-app-beta.vercel.app";

/** Ed25519 en PKCS8/DER base64: el formato que espera `common/qr/firma.ts`. */
const claveQr = () =>
  generateKeyPairSync("ed25519").privateKey.export({ format: "der", type: "pkcs8" }).toString("base64");

/**
 * Mezcla el `.env` existente con los valores de Supabase local. Los que ya tenga el usuario no se
 * pisan, salvo los que dependen de la BD local (si no, la API apuntaría a otra base de datos).
 */
export function fusionarEnv(actual, supabase, aleatorio = () => randomBytes(32).toString("hex")) {
  const forzados = {
    DATABASE_URL: DB_URL,
    SUPABASE_URL: "http://127.0.0.1:54321",
    SUPABASE_ANON_KEY: supabase.ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: supabase.SERVICE_ROLE_KEY,
  };
  const porDefecto = {
    NODE_ENV: "development",
    API_PORT: "3000",
    QR_SIGNING_PRIVATE_KEY: claveQr(),
    JWT_SECRET: aleatorio(),
    CORS_ORIGINS: `http://localhost:5173,http://127.0.0.1:5173,http://localhost:8081,${ORIGEN_VERCEL}`,
  };
  const lineas = actual.split(/\r?\n/);
  const vistos = new Set();
  const salida = lineas.map((linea) => {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(linea);
    if (!m) return linea;
    const [, clave, valor] = m;
    vistos.add(clave);
    if (clave in forzados) return `${clave}=${forzados[clave]}`;
    if (clave in porDefecto && valor.trim() === "") return `${clave}=${porDefecto[clave]}`;
    if (clave === "CORS_ORIGINS" && !valor.split(",").includes(ORIGEN_VERCEL)) return `${clave}=${valor},${ORIGEN_VERCEL}`;
    return linea;
  });
  for (const [clave, valor] of Object.entries({ ...forzados, ...porDefecto })) {
    if (!vistos.has(clave)) salida.push(`${clave}=${valor}`);
  }
  return salida.join("\n").replace(/\n*$/, "\n");
}

/** `KEY="valor"` por línea (salida de `supabase status -o env`) → objeto. */
export function leerEnvSupabase(texto) {
  return Object.fromEntries(
    [...texto.matchAll(/^([A-Z0-9_]+)="?(.*?)"?\s*$/gm)].map((m) => [m[1], m[2]]),
  );
}

// --- de aquí para abajo, solo al ejecutarlo -----------------------------------------------------

function paso(texto) {
  console.log(`\n▶ ${texto}`);
}

function ejecutar(comando, opciones = {}) {
  execSync(comando, { cwd: raiz, stdio: "inherit", ...opciones });
}

function pnpm() {
  // En algunos Windows `pnpm` no está en el PATH aunque corepack sí: se usa por corepack.
  return spawnSync("pnpm", ["--version"], { shell: true, stdio: "ignore" }).status === 0
    ? "pnpm"
    : "corepack pnpm";
}

async function esperarApi(url, segundos = 90) {
  for (let i = 0; i < segundos; i++) {
    try {
      const r = await fetch(url);
      if ((await r.json()).baseDatos === "ok") return true;
    } catch {
      /* aún arrancando */
    }
    await new Promise((ok) => setTimeout(ok, 1000));
  }
  return false;
}

async function principal() {
  const args = new Set(process.argv.slice(2));
  const p = pnpm();

  paso("Comprobando Docker");
  if (spawnSync("docker", ["info"], { stdio: "ignore", shell: true }).status !== 0) {
    console.error("Docker no está arrancado. Abre Docker Desktop y vuelve a lanzar `pnpm local`.");
    process.exit(1);
  }

  paso("Supabase local (aplica todas las migraciones la primera vez)");
  // Tras un apagado brusco de Docker, Postgres tarda en recuperarse y `supabase start` se rinde antes.
  for (let intento = 1; ; intento++) {
    try {
      ejecutar(`${p} db:start`);
      break;
    } catch (e) {
      if (intento === 5) throw e;
      console.log(`  Supabase aún no está listo: reintento ${intento + 1} de 5 en 20 s...`);
      await new Promise((ok) => setTimeout(ok, 20_000));
    }
  }

  paso("Escribiendo .env con las claves de Supabase local");
  const estado = execSync(`${p} exec supabase status --workdir backend/database -o env`, {
    cwd: raiz,
    encoding: "utf8",
  });
  const rutaEnv = join(raiz, ".env");
  const base = existsSync(rutaEnv)
    ? readFileSync(rutaEnv, "utf8")
    : readFileSync(join(raiz, ".env.example"), "utf8");
  writeFileSync(rutaEnv, fusionarEnv(base, leerEnvSupabase(estado)));
  console.log("  .env listo (no se sube: está en .gitignore)");

  if (!args.has("--sin-importar")) {
    const env = { ...process.env, DATABASE_URL: DB_URL };
    paso("Catálogo AV/LD/MD de Renfe");
    ejecutar(`${p} --filter @renfe/gtfs-worker importar`, { env });
    if (!args.has("--sin-cercanias")) {
      paso("Catálogo de Cercanías (~2 min)");
      ejecutar(`${p} --filter @renfe/gtfs-worker importar --feed cercanias`, {
        env: { ...env, NODE_OPTIONS: "--max-old-space-size=6144" },
      });
    }
    // Sin esto los trenes de AV/LD/MD se dibujan en línea recta entre paradas.
    paso("Recorrido por las vías (OSM; la primera vez descarga la red, varios minutos)");
    ejecutar(`${p} --filter @renfe/gtfs-worker vias`, { env: { ...env, NODE_OPTIONS: "--max-old-space-size=6144" } });
  }

  const soloApi = args.has("--solo-api");
  paso(soloApi ? "API en Docker" : "API, web y app móvil en Docker");
  ejecutar(`docker compose -f docker-compose.local.yml up -d --build${soloApi ? " api" : ""}`);
  const ok = await esperarApi("http://localhost:3000/health");
  if (!ok) {
    console.error("La API no responde con la BD. Mira `docker compose -f docker-compose.local.yml logs api`.");
    process.exit(1);
  }

  if (soloApi) {
    console.log("\n✔ API levantada en http://localhost:3000 (docs: http://localhost:3000/docs)");
    return;
  }
  console.log(`
✔ Todo levantado
  API ........... http://localhost:3000   (docs: http://localhost:3000/docs)
  Supabase Studio  http://127.0.0.1:54323
  Web ........... http://localhost:5173
  App (web) ..... http://localhost:8081
  App (Expo Go) . EXPO_PUBLIC_API_URL=http://<IP-de-este-PC>:3000 ${p} dev:mobile

  Para pararlo: .\\arrancar.cmd -Cerrar   (los datos se conservan)
`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  principal().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
