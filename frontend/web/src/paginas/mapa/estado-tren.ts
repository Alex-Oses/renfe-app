// Deducciones sobre un tren del mapa que no dependen de React: así se pueden probar solas.
// El retraso de GTFS-RT puede ser negativo (el tren va adelantado) y null (la fuente no lo dice):
// tratarlo como "0 o tarde" daría por puntual un tren del que no sabemos nada.
import type { ParadaRuta } from "@renfe/shared/api/tipos";

export type NivelRetraso = "ok" | "medio" | "alto" | "sin-datos";

const minutos = (seg: number) => Math.round(seg / 60);

// Texto para la etiqueta del mapa: "A tiempo", "Retraso 12 min", "Adelantado 3 min", "Sin datos".
export function etiquetaRetraso(seg: number | null | undefined): string {
  if (seg === null || seg === undefined || Number.isNaN(seg)) return "Sin datos";
  const min = minutos(seg);
  if (min === 0) return "A tiempo";
  return min > 0 ? `Retraso ${min} min` : `Adelantado ${-min} min`;
}

// Color de la etiqueta. Ir adelantado no es un problema: cuenta como puntual, que es lo que le
// importa a quien espera en el andén.
export function nivelRetraso(seg: number | null | undefined): NivelRetraso {
  if (seg === null || seg === undefined || Number.isNaN(seg)) return "sin-datos";
  const min = minutos(seg);
  if (min <= 0) return "ok";
  return min <= 15 ? "medio" : "alto";
}

// Vuelve a marcar qué paradas ya han pasado comparando con el reloj del navegador.
// Se hace cada segundo sin pedir nada a la API: las horas ya vienen con el retraso aplicado.
export function repasarParadas(paradas: ParadaRuta[], ahoraMs = Date.now()): ParadaRuta[] {
  let cambio = false;
  const nuevas = paradas.map((p) => {
    const t = Date.parse(p.llegada);
    const pasada = Number.isNaN(t) ? p.pasada : t <= ahoraMs;
    if (pasada === p.pasada) return p;
    cambio = true;
    return { ...p, pasada };
  });
  // Sin cambios se devuelve el mismo array: el mapa no se vuelve a pintar cada segundo.
  return cambio ? nuevas : paradas;
}

export const progresoDe = (paradas: ParadaRuta[]): number => {
  if (!paradas.length) return 0;
  return paradas.filter((p) => p.pasada).length / paradas.length;
};

// La siguiente parada es la primera a la que todavía no ha llegado.
export const proximaDe = (paradas: ParadaRuta[]): ParadaRuta | undefined => paradas.find((p) => !p.pasada);

// Primera y última parada del recorrido, para enseñar "Sale a las"/"Llega a las".
export const extremos = (paradas: ParadaRuta[]): { salida?: ParadaRuta; llegada?: ParadaRuta } => ({
  salida: paradas[0],
  llegada: paradas[paradas.length - 1],
});

// "Madrid-Puerta de Atocha" → "Madrid": quita el nombre de la estación (tras el guion) y deja la
// ciudad entera, sea cual sea su largo ("San Sebastián", "Jardines de Hércules"); la lista la parte en líneas.
export function ciudadCorta(estacion: string): string {
  return estacion.split("-")[0]!.trim() || estacion;
}
