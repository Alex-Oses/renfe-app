/**
 * Variables de entorno del importador.
 *
 * No se añade `dotenv`: se lee el `.env` de la raíz del repo a mano si existe,
 * sin pisar lo que ya venga del entorno (`DATABASE_URL=… pnpm gtfs:importar`
 * manda siempre). El `.env` está en `.gitignore`; `.env.example` documenta las claves.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

/** Busca `.env` desde el directorio actual hacia arriba (máximo 4 niveles). */
export function cargarEnv(): void {
  let directorio = resolve(process.cwd());
  for (let nivel = 0; nivel < 4; nivel += 1) {
    const candidato = join(directorio, ".env");
    if (existsSync(candidato)) {
      aplicar(candidato);
      return;
    }
    const padre = dirname(directorio);
    if (padre === directorio) return;
    directorio = padre;
  }
}

function aplicar(ruta: string): void {
  for (const linea of readFileSync(ruta, "utf8").split(/\r?\n/)) {
    const limpia = linea.trim();
    if (limpia === "" || limpia.startsWith("#")) continue;
    const igual = limpia.indexOf("=");
    if (igual <= 0) continue;
    const clave = limpia.slice(0, igual).trim();
    const valor = sinComillas(limpia.slice(igual + 1).trim());
    // Una clave vacía en `.env` no debe pisar lo que venga del entorno.
    if (valor === "") continue;
    if (process.env[clave] === undefined || process.env[clave] === "") {
      process.env[clave] = valor;
    }
  }
}

function sinComillas(valor: string): string {
  if (valor.length >= 2 && (valor.startsWith('"') || valor.startsWith("'"))) {
    return valor.slice(1, -1);
  }
  return valor;
}

/** Devuelve una variable obligatoria o falla con un mensaje que dice qué hacer. */
export function variable(nombre: string, defecto?: string): string {
  const valor = process.env[nombre];
  if (valor !== undefined && valor !== "") return valor;
  if (defecto !== undefined) return defecto;
  throw new Error(
    `Falta la variable de entorno ${nombre}. Añádela al .env (ver .env.example) o pásala por delante: ${nombre}=… pnpm gtfs:importar`,
  );
}
