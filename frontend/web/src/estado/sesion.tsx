// Sesión del usuario. Dueño: agente de cuenta.
// Se guarda en sessionStorage: dura lo que la pestaña y no se comparte entre pestañas.
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { usarToken } from "@renfe/shared/api/cliente";
import { CLAVE_SESION } from "@renfe/shared/api/simulado-cuenta";
import type { Sesion, Usuario } from "@renfe/shared/api/tipos";

interface ValorSesion {
  sesion: Sesion | null;
  entrar: (s: Sesion) => void;
  salir: () => void;
  actualizarUsuario: (cambios: Partial<Usuario>) => void;
}

const Contexto = createContext<ValorSesion | null>(null);

function leerGuardada(): Sesion | null {
  try {
    const s = JSON.parse(sessionStorage.getItem(CLAVE_SESION) ?? "null") as Sesion | null;
    usarToken(s?.token ?? null);
    return s;
  } catch {
    return null;
  }
}

function persistir(s: Sesion | null) {
  usarToken(s?.token ?? null);
  try {
    if (s) sessionStorage.setItem(CLAVE_SESION, JSON.stringify(s));
    else sessionStorage.removeItem(CLAVE_SESION);
  } catch {
    // Sin almacenamiento la sesión vive solo en memoria.
  }
}

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(leerGuardada);

  const entrar = useCallback((s: Sesion) => {
    persistir(s);
    setSesion(s);
  }, []);
  const salir = useCallback(() => {
    persistir(null);
    setSesion(null);
  }, []);
  const actualizarUsuario = useCallback((cambios: Partial<Usuario>) => {
    setSesion((s) => {
      if (!s) return s;
      const nueva = { ...s, usuario: { ...s.usuario, ...cambios } };
      persistir(nueva);
      return nueva;
    });
  }, []);

  const valor = useMemo(() => ({ sesion, entrar, salir, actualizarUsuario }), [sesion, entrar, salir, actualizarUsuario]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSesion() {
  const v = useContext(Contexto);
  if (!v) throw new Error("useSesion fuera de ProveedorSesion");
  return v;
}
