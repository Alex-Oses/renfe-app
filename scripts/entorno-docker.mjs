#!/usr/bin/env node
// Arranca o para todo el entorno local que vive en Docker: Supabase (Base de datos + Auth)
// y la API del monorepo. La web y la app Expo se arrancan aparte (pnpm dev:web / dev:mobile).
//
//   pnpm entorno arrancar   # Supabase local + API en Docker (espera a /health)
//   pnpm entorno parar      # para la API y Supabase (los datos se conservan)
//   pnpm entorno estado     # qué está corriendo y cómo responde la API
//
// Requisitos: Docker Desktop arrancado y `pnpm install` hecho en la raíz.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { networkInterfaces } from "node:os";

const SUPABASE = ["exec", "supabase"];
const WORKDIR = ["--workdir", "backend/database"];
const SALUD = "http://localhost:3000/health";
const ACCIONES = ["arrancar", "parar", "estado"];

const accion = process.argv[2];
if (!ACCIONES.includes(accion)) {
  console.error(`Uso: pnpm entorno <${ACCIONES.join(" | ")}>`);
  process.exit(1);
}

const ejecutar = (comando, args, { opcional = false } = {}) => {
  const r = spawnSync(comando, args, { stdio: "inherit" });
  if (r.status !== 0) {
    if (opcional) return false;
    process.exit(r.status ?? 1);
  }
  return true;
};

// `pnpm` no siempre está en el PATH (corepack). Dentro de un script de pnpm, npm_execpath
// apunta a su binario: lo usamos con Node para que funcione igual en Windows y en Linux.
const ejecutarPnpm = (args, opcional = false) =>
  process.env.npm_execpath
    ? ejecutar(process.execPath, [process.env.npm_execpath, ...args], { opcional })
    : ejecutar("pnpm", args, { opcional });

const dockerVivo = () => spawnSync("docker", ["info"], { stdio: "ignore" }).status === 0;

const exigirDocker = () => {
  if (dockerVivo()) return;
  console.error("Docker no responde. Abre Docker Desktop y vuelve a intentarlo.");
  process.exit(1);
};

const exigirEnv = () => {
  if (existsSync(".env")) return;
  console.error(
    "\nFalta .env en la raíz. Supabase ya está arrancado: copia .env.example, rellena los valores\n" +
      "de `pnpm db:status` y vuelve a lanzar `pnpm entorno arrancar`.",
  );
  process.exit(1);
};

// IP de la LAN para que el móvil alcance la API: en el teléfono, "localhost" es el teléfono.
// Se saltan las interfaces virtuales (VirtualBox, WSL, Docker…), que no llegan al móvil.
const VIRTUAL = /virtualbox|vmware|hyper-v|vethernet|loopback|docker|wsl|tailscale|vpn/i;
const HOST_ONLY = /^192\.168\.(56|99)\./;
const ipLocal = () => {
  const candidatas = Object.entries(networkInterfaces())
    .filter(([nombre]) => !VIRTUAL.test(nombre))
    .flatMap(([nombre, lista]) => (lista ?? []).map((d) => ({ nombre, ...d })))
    .filter((d) => d.family === "IPv4" && !d.internal && !HOST_ONLY.test(d.address));
  const wifi = candidatas.find((d) => /wi-?fi|wlan|wireless/i.test(d.nombre));
  return (
    wifi ??
    candidatas.find((d) => d.address.startsWith("192.168.")) ??
    candidatas[0]
  )?.address ?? null;
};

const esperarApi = async (intentos = 30) => {
  for (let i = 0; i < intentos; i++) {
    try {
      const respuesta = await fetch(SALUD);
      if (respuesta.ok) {
        const cuerpo = await respuesta.json().catch(() => ({}));
        return cuerpo;
      }
    } catch {
      // El contenedor todavía está arrancando.
    }
    await new Promise((listo) => setTimeout(listo, 2000));
  }
  return null;
};

const estadoApi = async () => {
  try {
    const respuesta = await fetch(SALUD);
    const cuerpo = await respuesta.json().catch(() => ({}));
    const db = cuerpo.baseDatos ?? "desconocida";
    console.log(`  API        ${respuesta.ok ? "arriba" : `responde ${respuesta.status}`} · base de datos: ${db}`);
  } catch {
    console.log("  API        no responde en http://localhost:3000");
  }
};

if (accion === "arrancar") {
  exigirDocker();

  console.log("\n[1/2] Supabase local (Postgres 54322, Auth/API 54321)...");
  // Idempotente: si ya está arrancado, la CLI lo detecta y no toca los datos.
  ejecutarPnpm([...SUPABASE, "start", ...WORKDIR]);

  // Se comprueba después: las claves de Supabase que pide .env salen de `pnpm db:status`.
  exigirEnv();

  console.log("\n[2/2] API en Docker (http://localhost:3000)...");
  ejecutar("docker", ["compose", "up", "-d", "--build", "api"]);

  const salud = await esperarApi();
  if (!salud) {
    console.error("\nLa API no ha respondido a tiempo. Revisa los logs con: docker compose logs api");
    process.exit(1);
  }

  console.log("\nEntorno listo:");
  console.log("  API        http://localhost:3000/health");
  console.log(`             base de datos: ${salud.baseDatos ?? "sin dato"}`);
  console.log("  Supabase   http://127.0.0.1:54321 · Postgres 54322 · Studio 54323");
  console.log("\nWeb en local: VITE_API_URL=http://localhost:3000 pnpm dev:web");

  const ip = ipLocal();
  console.log("\nApp en el móvil (Expo Go, misma Wi-Fi que este PC):");
  if (ip) {
    console.log(`  añade a .env:  EXPO_PUBLIC_API_URL=http://${ip}:3000`);
    console.log(`                 EXPO_PUBLIC_POSICIONES_URL=http://${ip}:3000`);
    console.log("  y arranca:     pnpm dev:mobile   (reinicia Expo si ya estaba abierto)");
    console.log("  Si no conecta, permite el puerto 3000 en el firewall de Windows.");
  } else {
    console.log("  no encuentro la IP de la LAN: sácala con `ipconfig` y ponla en las dos variables.");
  }

  console.log("\nVercel: para que la web desplegada use esta API, expón el puerto 3000 con un túnel y pon");
  console.log("        esa URL en VITE_API_URL y su origen en CORS_ORIGINS (docs/levantar-en-local.md).");
  console.log("\nParar todo: pnpm entorno parar");
} else if (accion === "parar") {
  exigirDocker();

  console.log("\n[1/2] API en Docker...");
  ejecutar("docker", ["compose", "down"]);

  console.log("\n[2/2] Supabase local (se conservan los datos)...");
  // Si Supabase no estaba arrancado, la CLI devuelve error: aquí no es un problema.
  ejecutarPnpm([...SUPABASE, "stop", ...WORKDIR], true);

  console.log("\nEntorno parado. Los datos de Supabase siguen en su volumen de Docker.");
} else {
  console.log("\nDocker:");
  console.log(`  ${dockerVivo() ? "Docker Desktop responde" : "Docker Desktop no responde"}`);
  console.log("\nContenedores del compose:");
  ejecutar("docker", ["compose", "ps"], { opcional: true });
  console.log("\nSupabase local:");
  ejecutarPnpm([...SUPABASE, "status", ...WORKDIR], true);
  console.log("");
  await estadoApi();
}
