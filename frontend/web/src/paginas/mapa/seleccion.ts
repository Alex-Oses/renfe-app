export type ClicMapa = { tipo: "tren"; trenId: string } | { tipo: "fondo" };

/** Un clic en un tren selecciona ese tren; uno en el fondo cierra la selección. */
export function seleccionTrasClic(clic: ClicMapa): string | null {
  return clic.tipo === "tren" ? clic.trenId : null;
}
