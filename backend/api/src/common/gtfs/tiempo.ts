// Conversión de horas GTFS a ISO 8601 con offset de Madrid.
// GTFS permite horas >= 24 (`25:10` = la 01:10 del día siguiente) e `interval`
// es «tiempo desde el inicio del día de servicio», en hora local de Madrid.
const ZONA = 'Europe/Madrid';

/** Minutos que Madrid va por delante de UTC en ese instante (60 en verano, 60/120…). */
function desfaseEnMinutos(instante: Date): number {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: ZONA,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instante);

  const p: Record<string, number> = {};
  for (const { type, value } of partes) p[type] = Number(value);

  const muro = Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute, p.second);
  return (muro - Math.floor(instante.getTime() / 1000) * 1000) / 60_000;
}

const dosDigitos = (n: number) => String(n).padStart(2, '0');

/** Desfase con formato `+HH:MM`. Se recalcula con el instante ya corregido por el cambio de hora. */
function desfaseIso(muroMs: number): string {
  const primero = desfaseEnMinutos(new Date(muroMs));
  const definitivo = desfaseEnMinutos(new Date(muroMs - primero * 60_000));

  const signo = definitivo < 0 ? '-' : '+';
  const abs = Math.abs(definitivo);
  return `${signo}${dosDigitos(Math.floor(abs / 60))}:${dosDigitos(abs % 60)}`;
}

/** `2026-11-02` + `25:10:00` → `2026-11-03T01:10:00+01:00`. */
export function intervaloAIso(fecha: string, intervalo: string): string {
  const [horas = 0, minutos = 0, segundos = 0] = intervalo.split(':').map(Number);
  const [anio, mes, dia] = fecha.split('-').map(Number);

  // El reloj de pared de Madrid, expresado como si fuera UTC (día + horas, que pueden pasar de 24).
  const muro = Date.UTC(anio, mes - 1, dia) + horas * 3_600_000 + minutos * 60_000 + segundos * 1000;
  const reloj = new Date(muro);

  return (
    `${reloj.getUTCFullYear()}-${dosDigitos(reloj.getUTCMonth() + 1)}-${dosDigitos(reloj.getUTCDate())}` +
    `T${dosDigitos(reloj.getUTCHours())}:${dosDigitos(reloj.getUTCMinutes())}:${dosDigitos(reloj.getUTCSeconds())}` +
    desfaseIso(muro)
  );
}

/** Duración en minutos entre dos horas GTFS del mismo día de servicio. */
export function duracionMin(desde: string, hasta: string): number {
  const aSegundos = (intervalo: string) =>
    intervalo
      .split(':')
      .map(Number)
      .reduce((total, parte) => total * 60 + parte, 0);

  return Math.round((aSegundos(hasta) - aSegundos(desde)) / 60);
}
