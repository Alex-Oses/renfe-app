export const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
export const hora = (iso: string) => iso.slice(11, 16);
export const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
