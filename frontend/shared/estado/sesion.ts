// Sesión guardada en sessionStorage (la web) o en su sustituto con SQLite (la app, ver polyfills.ts).
import { usarToken } from "../api/cliente";
import { CLAVE_SESION } from "../api/simulado-cuenta";
import type { Sesion } from "../api/tipos";

export function leerSesion(): Sesion | null {
  try {
    const s = JSON.parse(sessionStorage.getItem(CLAVE_SESION) ?? "null") as Sesion | null;
    return s?.token && s.usuario?.email ? s : null;
  } catch {
    return null; // sesión corrupta: se ignora
  }
}

export function guardarSesion(s: Sesion | null) {
  usarToken(s?.token ?? null);
  try {
    if (s) sessionStorage.setItem(CLAVE_SESION, JSON.stringify(s));
    else sessionStorage.removeItem(CLAVE_SESION);
  } catch {
    /* sin almacenamiento: la sesión dura lo que la app o la pestaña abierta */
  }
}
