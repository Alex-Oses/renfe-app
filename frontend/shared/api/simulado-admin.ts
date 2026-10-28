// Resumen para administración sin API: cuenta lo guardado en este navegador.
// Con API: GET /admin/resumen (propuesto en endpoints.md), con los datos de todo el sistema.
import { ciudadDe, type ResumenAdmin } from "./tipos";
import { _todo } from "./simulado-reservas";

const contar = (clave: string) => {
  try {
    return Object.keys(JSON.parse(localStorage.getItem(clave) ?? "{}") as object).length;
  } catch {
    return 0;
  }
};

export function resumen(): ResumenAdmin {
  const { reservas, billetes } = _todo();
  const pagadas = reservas.filter((r) => r.estado === "pagada");
  return {
    billetesVendidos: billetes.length,
    reservas: reservas.length,
    reservasCanceladas: reservas.filter((r) => r.estado === "cancelada").length,
    ingresos: pagadas.reduce((s, r) => s + r.total, 0),
    validaciones: contar("anden.validaciones"),
    usuarios: contar("anden.usuarios"),
    ultimasReservas: [...reservas]
      .sort((a, b) => b.creada.localeCompare(a.creada))
      .slice(0, 10)
      .map((r) => ({
        localizador: r.localizador,
        trayecto: `${ciudadDe(r.tren.origen)} → ${ciudadDe(r.tren.destino)}`,
        total: r.total,
        estado: r.estado,
        creada: r.creada,
      })),
  };
}
