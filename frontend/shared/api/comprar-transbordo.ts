// Compra un viaje con transbordo: primero el tramo 1 y luego el 2. Si el segundo falla, el primero
// no sirve de nada, así que se cancela para no cobrar medio viaje y se relanza el error.
export async function comprarDosTramos<R extends { localizador: string }>(
  comprarTramo: (indice: 0 | 1) => Promise<R>,
  cancelar: (localizador: string) => Promise<unknown>,
): Promise<[R, R]> {
  const primera = await comprarTramo(0);
  try {
    return [primera, await comprarTramo(1)];
  } catch (fallo) {
    await cancelar(primera.localizador).catch(() => undefined);
    throw fallo;
  }
}

// El tripId de un mismo servicio cambia entre búsquedas (lleva la fecha de su calendario GTFS), así que
// la opción elegida se identifica por tipo, número y hora de salida de cada tren, no por su id.
export const claveTramo = (t: { tipo: string; numero: string; salida: string }) => `${t.tipo}|${t.numero}|${t.salida}`;

export const buscarOpcion = <O extends { tramos: [{ tipo: string; numero: string; salida: string }, { tipo: string; numero: string; salida: string }] }>(
  lista: O[],
  a: string | undefined | null,
  b: string | undefined | null,
): O | undefined => lista.find((o) => claveTramo(o.tramos[0]) === a && claveTramo(o.tramos[1]) === b);
