// Historial de avisos de la app, como estado/avisos.tsx de la web: guardado en localStorage
// (en móvil va sobre SQLite por los polyfills) y compartido con useSyncExternalStore.
import * as Crypto from "expo-crypto";
import * as Notifications from "expo-notifications";
import { useSyncExternalStore } from "react";
import { AppState, Platform } from "react-native";
import type { Aviso, NuevoAviso } from "@renfe/shared/api/tipos";

export type AvisoLocal = Aviso & { grave?: boolean };
export type PermisoAvisos = "granted" | "denied" | "undetermined" | "no-disponible";

const CLAVE = "anden.avisos";

interface Estado {
  avisos: AvisoLocal[];
  emergentes: string[]; // ids que se ven ahora como aviso emergente
  permiso: PermisoAvisos;
}

function leer(): AvisoLocal[] {
  try {
    return (JSON.parse(localStorage.getItem(CLAVE) ?? "null") as AvisoLocal[]) ?? [];
  } catch {
    return [];
  }
}

let estado: Estado = { avisos: leer(), emergentes: [], permiso: Platform.OS === "web" ? "no-disponible" : "undetermined" };
const oyentes = new Set<() => void>();

function cambiar(parcial: Partial<Estado>) {
  estado = { ...estado, ...parcial };
  if (parcial.avisos) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(estado.avisos));
    } catch {
      /* sin almacenamiento: se queda en memoria */
    }
  }
  oyentes.forEach((o) => o());
}

const suscribir = (o: () => void) => (oyentes.add(o), () => void oyentes.delete(o));
export const useAvisos = () => useSyncExternalStore(suscribir, () => estado);

// Las reglas compartidas enlazan a rutas de la web; en la app el mapa es /directo.
export const rutaApp = (enlace: string) => enlace.replace(/^\/mapa(?=[?/]|$)/, "/directo");

export function avisar(a: NuevoAviso) {
  const nuevo: AvisoLocal = { ...a, id: Crypto.randomUUID(), creado: new Date().toISOString(), leido: false };
  cambiar({ avisos: [nuevo, ...estado.avisos].slice(0, 50), emergentes: [nuevo.id, ...estado.emergentes].slice(0, 4) });
  // Con la app abierta basta el emergente; la notificación del sistema solo si está en segundo plano.
  if (estado.permiso === "granted" && AppState.currentState !== "active") {
    void Notifications.scheduleNotificationAsync({ content: { title: a.titulo, body: a.texto }, trigger: null }).catch(() => {});
  }
}

export const marcarLeido = (id: string) => cambiar({ avisos: estado.avisos.map((x) => (x.id === id ? { ...x, leido: true } : x)) });
export const marcarTodosLeidos = () => cambiar({ avisos: estado.avisos.map((x) => ({ ...x, leido: true })) });
export const borrarHistorial = () => cambiar({ avisos: [], emergentes: [] });
export const cerrarEmergente = (id: string) => cambiar({ emergentes: estado.emergentes.filter((x) => x !== id) });

const aPermiso = (p: Notifications.NotificationPermissionsStatus | null): PermisoAvisos =>
  !p ? "no-disponible" : p.granted ? "granted" : p.canAskAgain ? "undetermined" : "denied";

export async function leerPermiso() {
  if (Platform.OS === "web") return;
  cambiar({ permiso: aPermiso(await Notifications.getPermissionsAsync().catch(() => null)) });
}

export async function pedirPermiso() {
  if (Platform.OS === "web") return;
  cambiar({ permiso: aPermiso(await Notifications.requestPermissionsAsync().catch(() => null)) });
}
