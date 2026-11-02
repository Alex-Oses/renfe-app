// Nombres de estación vistos durante la sesión. /trenes enlaza con el id y el buscador solo guarda
// texto, así que sin esta memoria al volver del resultado no se sabría cómo se llama la estación.
// Se guarda en `sessionStorage` para que un F5 en /trenes no deje el campo «Desde» vacío; la app no
// tiene `sessionStorage`, así que allí sigue viviendo solo en memoria.
import type { Estacion } from "./tipos";

const CLAVE = "renfe.estaciones";
// Con ~1 150 estaciones en el catálogo, 200 sobra para una sesión y no llena el almacenamiento.
const MAXIMO = 200;

const almacen = (): Storage | undefined => {
  try {
    return typeof sessionStorage === "undefined" ? undefined : sessionStorage;
  } catch {
    // Safari en navegación privada lanza al tocar el almacenamiento.
    return undefined;
  }
};

const vistas = new Map<string, Estacion>();
let cargado = false;

function cargar(): void {
  if (cargado) return;
  cargado = true;
  try {
    const guardadas = JSON.parse(almacen()?.getItem(CLAVE) ?? "[]") as unknown;
    if (Array.isArray(guardadas)) {
      for (const e of guardadas as Estacion[]) if (e?.id) vistas.set(e.id, e);
    }
  } catch {
    // JSON roto o almacenamiento bloqueado: se empieza vacío, no es un dato de negocio.
  }
}

function guardar(): void {
  const s = almacen();
  if (!s) return;
  try {
    s.setItem(CLAVE, JSON.stringify([...vistas.values()].slice(-MAXIMO)));
  } catch {
    // Sin espacio o sin permiso: la memoria en RAM sigue funcionando.
  }
}

export function recordarEstaciones(lista: Estacion[]): void {
  cargar();
  for (const e of lista) if (e?.id) vistas.set(e.id, e);
  guardar();
}

export const estacionConocida = (id?: string | null): Estacion | undefined => {
  if (!id) return undefined;
  cargar();
  return vistas.get(id);
};
