#!/usr/bin/env node
// Levanta todo el stack en local con un solo comando (ver docs/levantar-en-local.md):
// Supabase (Docker, con las migraciones), `.env` con sus claves, catálogo GTFS real y la API en Docker.
// Uso: pnpm local [--sin-cercanias] [--sin-importar]
//   --sin-cercanias  solo AV/LD/MD (Cercanías son ~2 M de horarios, ~2 min más)
//   --sin-importar   no vuelve a cargar los horarios (si la BD ya los tiene)

import { execSync, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const DB_URL = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

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
    SUPABASE_JWT_SECRET: supabase.JWT_SECRET,
  };
  const porDefecto = {
    NODE_ENV: "development",
    API_PORT: "3000",
    QR_SIGNING_SECRET: aleatorio(),
    CORS_ORIGINS: "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8081",
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
  ejecutar(`${p} db:start`);

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

  paso("API, web y app móvil en Docker");
  ejecutar("docker compose up -d --build");
  const ok = await esperarApi("http://localhost:3000/health");
  if (!ok) {
    console.error("La API no responde con la BD. Mira `docker compose logs api`.");
    process.exit(1);
  }

  console.log(`
✔ Todo levantado
  API ........... http://localhost:3000   (docs: http://localhost:3000/docs)
  Supabase Studio  http://127.0.0.1:54323
  Web ........... http://localhost:5173
  App (web) ..... http://localhost:8081
  App (Expo Go) . EXPO_PUBLIC_API_URL=http://<IP-de-este-PC>:3000 ${p} dev:mobile

  Para pararlo: docker compose down && ${p} db:stop   (los datos se conservan)
`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  principal().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
