// Avisos (pop-ups), líneas favoritas y trenes seguidos. Dueño: agente de notificaciones.
// API estable que usan otras páginas: useAvisos().{avisar, favoritos, alternarFavorito, seguir, dejarDeSeguir, seguimientos}
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Aviso, LineaFavorita, NuevoAviso, Seguimiento } from "@renfe/shared/api/tipos";
import { AvisosEmergentes } from "../componentes/AvisosEmergentes";
import { Vigilante } from "./vigilante";

// grave: retraso importante; el pop-up usa role="alert" en vez de "status".
export type AvisoLocal = Aviso & { grave?: boolean };
export type { NuevoAviso };
export type PermisoAvisos = NotificationPermission | "no-disponible";

interface ValorAvisos {
  avisos: AvisoLocal[];
  avisar: (a: NuevoAviso) => void;
  marcarLeido: (id: string) => void;
  marcarTodosLeidos: () => void;
  borrarHistorial: () => void;
  emergentes: string[]; // ids de los avisos que se ven como pop-up ahora mismo
  cerrarEmergente: (id: string) => void;
  permiso: PermisoAvisos;
  pedirPermiso: () => void;
  favoritos: LineaFavorita[];
  esFavorita: (origen: string, destino: string) => boolean;
  alternarFavorito: (origen: string, destino: string) => void;
  moverFavorito: (id: string, paso: -1 | 1) => void;
  seguimientos: Seguimiento[];
  seguir: (s: Seguimiento) => void;
  dejarDeSeguir: (trenId: string) => void;
}

const Contexto = createContext<ValorAvisos | null>(null);

function leer<T>(clave: string, porDefecto: T): T {
  try {
    return (JSON.parse(localStorage.getItem(clave) ?? "null") as T) ?? porDefecto;
  } catch {
    return porDefecto;
  }
}
function guardar(clave: string, valor: unknown) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    /* sin almacenamiento: se queda en memoria */
  }
}

const permisoActual = (): PermisoAvisos => (typeof Notification === "undefined" ? "no-disponible" : Notification.permission);

export function ProveedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<AvisoLocal[]>(() => leer("anden.avisos", []));
  const [emergentes, setEmergentes] = useState<string[]>([]);
  const [permiso, setPermiso] = useState<PermisoAvisos>(permisoActual);
  const [favoritos, setFavoritos] = useState<LineaFavorita[]>(() => leer("anden.favoritos", []));
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>(() => leer("anden.seguimientos", []));

  const valor = useMemo<ValorAvisos>(() => {
    const actualizarAvisos = (f: (xs: AvisoLocal[]) => AvisoLocal[]) =>
      setAvisos((xs) => {
        const n = f(xs).slice(0, 50);
        guardar("anden.avisos", n);
        return n;
      });
    const actualizarFav = (f: LineaFavorita[]) => (setFavoritos(f), guardar("anden.favoritos", f));
    const actualizarSeg = (s: Seguimiento[]) => (setSeguimientos(s), guardar("anden.seguimientos", s));
    return {
      avisos,
      avisar: (a) => {
        const nuevo: AvisoLocal = { ...a, id: crypto.randomUUID(), creado: new Date().toISOString(), leido: false };
        actualizarAvisos((xs) => [nuevo, ...xs]);
        setEmergentes((xs) => [nuevo.id, ...xs].slice(0, 4));
        // Notificación del sistema solo si el usuario la activó con el botón de la campana.
        if (permisoActual() === "granted" && document.hidden) {
          try {
            new Notification(a.titulo, { body: a.texto, tag: nuevo.id });
          } catch {
            /* algunos navegadores móviles solo permiten notificaciones desde un service worker */
          }
        }
      },
      marcarLeido: (id) => actualizarAvisos((xs) => xs.map((x) => (x.id === id ? { ...x, leido: true } : x))),
      marcarTodosLeidos: () => actualizarAvisos((xs) => xs.map((x) => ({ ...x, leido: true }))),
      borrarHistorial: () => (actualizarAvisos(() => []), setEmergentes([])),
      emergentes,
      cerrarEmergente: (id) => setEmergentes((xs) => xs.filter((x) => x !== id)),
      permiso,
      pedirPermiso: () => {
        if (typeof Notification === "undefined") return;
        void Notification.requestPermission().then(setPermiso);
      },
      favoritos,
      esFavorita: (o, d) => favoritos.some((f) => f.id === `${o}-${d}`),
      alternarFavorito: (o, d) => {
        const id = `${o}-${d}`;
        actualizarFav(favoritos.some((f) => f.id === id) ? favoritos.filter((f) => f.id !== id) : [...favoritos, { id, origen: o, destino: d }]);
      },
      moverFavorito: (id, paso) => {
        const i = favoritos.findIndex((f) => f.id === id);
        const j = i + paso;
        if (i < 0 || j < 0 || j >= favoritos.length) return;
        const n = [...favoritos];
        [n[i], n[j]] = [n[j], n[i]];
        actualizarFav(n);
      },
      seguimientos,
      seguir: (s) => actualizarSeg([...seguimientos.filter((x) => x.trenId !== s.trenId), s]),
      dejarDeSeguir: (trenId) => actualizarSeg(seguimientos.filter((x) => x.trenId !== trenId)),
    };
  }, [avisos, emergentes, permiso, favoritos, seguimientos]);

  return (
    <Contexto.Provider value={valor}>
      {children}
      <AvisosEmergentes />
      <Vigilante />
    </Contexto.Provider>
  );
}

export function useAvisos() {
  const v = useContext(Contexto);
  if (!v) throw new Error("useAvisos fuera de ProveedorAvisos");
  return v;
}
