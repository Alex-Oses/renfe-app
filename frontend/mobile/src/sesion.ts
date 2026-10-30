// Sesión guardada como en la web (sessionStorage; en la app es SQLite, ver polyfills.ts).
// Se restaura al arrancar para que billetes y abonos lleven el token aunque no se abra Cuenta.
import { usarToken } from "@renfe/shared/api/cliente";
import { CLAVE_SESION } from "@renfe/shared/api/simulado-cuenta";
import type { Sesion } from "@renfe/shared/api/tipos";

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
    /* sin almacenamiento: la sesión dura lo que la app abierta */
  }
}

export const restaurarSesion = () => usarToken(leerSesion()?.token ?? null);
