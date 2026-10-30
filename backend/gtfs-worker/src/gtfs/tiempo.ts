/**
 * Conversiones de fechas y horas de GTFS.
 *
 * GTFS publica las fechas como `YYYYMMDD` y las horas como `H:MM:SS` o
 * `HH:MM:SS`, **sin límite de 24 h**: un tren que acaba a las 01:10 aparece como
 * `25:10:00`. Por eso en la base de datos se guardan como `interval` y aquí solo
 * se normalizan a `HH:MM:SS`.
 */

/** `20261028` → `2026-10-28`. Lanza si no es una fecha válida. */
export function fechaGtfs(valor: string): string {
  const limpio = valor.trim();
  if (!/^\d{8}$/.test(limpio)) {
    throw new Error(`Fecha GTFS no válida: «${valor}»`);
  }
  const anio = limpio.slice(0, 4);
  const mes = limpio.slice(4, 6);
  const dia = limpio.slice(6, 8);
  const fecha = new Date(`${anio}-${mes}-${dia}T00:00:00Z`);
  if (Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== `${anio}-${mes}-${dia}`) {
    throw new Error(`Fecha GTFS inexistente: «${valor}»`);
  }
  return `${anio}-${mes}-${dia}`;
}

/**
 * `8:30:00` → `08:30:00`; `25:10:00` → `25:10:00`; vacío → `null`.
 * Acepta también `HH:MM` (algunos feeds omiten los segundos).
 */
export function horaGtfs(valor: string): string | null {
  const limpio = valor.trim();
  if (limpio === "") return null;
  const partes = limpio.split(":");
  if (partes.length < 2 || partes.length > 3) {
    throw new Error(`Hora GTFS no válida: «${valor}»`);
  }
  const [horas, minutos, segundos = "0"] = partes.map((parte) => parte.trim());
  if (horas === undefined || minutos === undefined) {
    throw new Error(`Hora GTFS no válida: «${valor}»`);
  }
  const numeros = [horas, minutos, segundos].map((parte) => Number(parte));
  if (numeros.some((numero) => !Number.isInteger(numero) || numero < 0)) {
    throw new Error(`Hora GTFS no válida: «${valor}»`);
  }
  const [h, m, s] = numeros as [number, number, number];
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * `wheelchair_boarding`: `1` → `true`, `2` → `false`, `0`/vacío → `null`.
 * Se devuelve `null` y no `false` porque en GTFS el 0 significa «no se sabe».
 */
export function booleanoGtfs(valor: string | undefined): boolean | null {
  const limpio = (valor ?? "").trim();
  if (limpio === "1") return true;
  if (limpio === "2") return false;
  return null;
}

/** `pickup_type`/`drop_off_type`: `0` (o columna ausente) significa que sí. */
export function permiteGtfs(valor: string | undefined): boolean {
  const limpio = (valor ?? "").trim();
  return limpio === "" || limpio === "0";
}

/** Fecha de hoy en Madrid, en formato `YYYY-MM-DD`. */
export function hoyEnMadrid(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ahora);
}
