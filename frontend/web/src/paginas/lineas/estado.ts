import type { Tren } from "@renfe/shared/api/tipos";

// Próximos trenes de la línea: los que aún no han salido, como mucho cuatro.
export function proximosTrenes(trenes: Tren[], ahora: number = Date.now()): Tren[] {
  return trenes
    .filter((tren) => {
      const salida = Date.parse(tren.salida);
      return Number.isFinite(salida) && salida > ahora;
    })
    .slice(0, 4);
}

export type EstadoLinea =
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "vacia" }
  | { tipo: "trenes"; trenes: Tren[] };

/**
 * Un fallo de la API no es una línea sin trenes: se muestra como error con reintento. El estado
 * vacío solo se usa cuando la consulta ha respondido y no quedan salidas futuras.
 */
export function estadoDeLinea({
  trenes,
  error,
  ahora = Date.now(),
}: {
  trenes: Tren[] | null;
  error: string;
  ahora?: number;
}): EstadoLinea {
  if (error) return { tipo: "error", mensaje: error };
  if (trenes === null) return { tipo: "cargando" };
  const proximos = proximosTrenes(trenes, ahora);
  return proximos.length > 0 ? { tipo: "trenes", trenes: proximos } : { tipo: "vacia" };
}
