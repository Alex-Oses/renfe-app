// Sesión guardada como en la web (sessionStorage; en la app es SQLite, ver polyfills.ts).
// Se restaura al arrancar para que billetes y abonos lleven el token aunque no se abra Cuenta.
import { alSesionInvalida, usarToken } from "@renfe/shared/api/cliente";
import { guardarSesion, leerSesion } from "@renfe/shared/estado/sesion";

export { guardarSesion, leerSesion };

// Token rechazado o API cambiada: se borra la sesión guardada y Cuenta vuelve a pedir entrar.
alSesionInvalida(() => guardarSesion(null));

export const restaurarSesion = () => usarToken(leerSesion()?.token ?? null);
