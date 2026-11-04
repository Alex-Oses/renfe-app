import { TARIFAS } from "./simulado-precios";
import type { IdTarifa } from "./tipos";

export const TARIFA_POR_DEFECTO: IdTarifa = "basico";

/**
 * La URL puede traer cualquier texto (enlace manipulado, versión antigua o la etiqueta «Elige»).
 * Solo se acepta un `id` del contrato; el resto cae al básico para que la API nunca reciba una
 * tarifa inventada.
 */
export function resolverTarifa(valor: string | null | undefined): IdTarifa {
  return TARIFAS.find((tarifa) => tarifa.id === valor)?.id ?? TARIFA_POR_DEFECTO;
}

export const nombreDeTarifa = (id: IdTarifa): string =>
  TARIFAS.find((tarifa) => tarifa.id === id)?.nombre ?? TARIFAS[0].nombre;
