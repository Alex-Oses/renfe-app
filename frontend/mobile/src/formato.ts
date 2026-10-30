// Fechas de la API (ISO con offset) en formato corto español.
export const hora = (iso: string) => new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
export const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
export const euros = (n: number) => `${n.toFixed(2).replace(".", ",")} €`;
export const hoyIso = () => new Date().toISOString().slice(0, 10);

// Abonos: fechas "AAAA-MM-DD" y texto de su estado (como MisAbonos.tsx de la web).
export const aFecha = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
export const TEXTO_ESTADO = { pendiente: "Aún no empieza", vigente: "Vigente", agotado: "Sin viajes", caducado: "Caducado" };
