// Sesión del usuario. Dueño: agente de cuenta.
// Se guarda en sessionStorage: dura lo que la pestaña y no se comparte entre pestañas.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { alSesionInvalida, usarToken } from "@renfe/shared/api/cliente";
import { guardarSesion, leerSesion } from "@renfe/shared/estado/sesion";
import type { Sesion, Usuario } from "@renfe/shared/api/tipos";

interface ValorSesion {
  sesion: Sesion | null;
  entrar: (s: Sesion) => void;
  salir: () => void;
  actualizarUsuario: (cambios: Partial<Usuario>) => void;
}

const Contexto = createContext<ValorSesion | null>(null);

function leerGuardada(): Sesion | null {
  const s = leerSesion();
  usarToken(s?.token ?? null);
  return s;
}

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(leerGuardada);

  const entrar = useCallback((s: Sesion) => {
    guardarSesion(s);
    setSesion(s);
  }, []);
  const salir = useCallback(() => {
    guardarSesion(null);
    setSesion(null);
  }, []);
  // Token rechazado o API cambiada: la sesión ya no sirve y hay que volver a entrar.
  useEffect(() => alSesionInvalida(salir), [salir]);
  const actualizarUsuario = useCallback((cambios: Partial<Usuario>) => {
    setSesion((s) => {
      if (!s) return s;
      const nueva = { ...s, usuario: { ...s.usuario, ...cambios } };
      guardarSesion(nueva);
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
