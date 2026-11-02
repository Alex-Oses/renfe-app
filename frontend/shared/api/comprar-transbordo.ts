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
