// Sesión del usuario. Dueño: agente de cuenta.
import { createContext, useContext, useState, type ReactNode } from "react";
import type { Sesion } from "../api/tipos";

interface ValorSesion {
  sesion: Sesion | null;
  entrar: (s: Sesion) => void;
  salir: () => void;
}

const Contexto = createContext<ValorSesion | null>(null);

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  return (
    <Contexto.Provider value={{ sesion, entrar: setSesion, salir: () => setSesion(null) }}>{children}</Contexto.Provider>
  );
}

export function useSesion() {
  const v = useContext(Contexto);
  if (!v) throw new Error("useSesion fuera de ProveedorSesion");
  return v;
}
