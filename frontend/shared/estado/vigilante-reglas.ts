// Reglas puras del vigilante: reciben datos y la hora, devuelven avisos con una clave única.
// La clave evita repetir el mismo aviso; el vigilante guarda las ya enviadas.
import type { Billete, PosicionTren, Seguimiento, Tren } from "../api/tipos";
import type { NuevoAviso } from "../api/tipos";

export type AvisoClave = NuevoAviso & { clave: string };

const MIN = 60_000;
const hora = (iso: string) => new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });


// (a) Trenes seguidos: aviso de llegada una vez por seguimiento y aviso cuando cambia el retraso.
export function reglasSeguimientos(segs: Seguimiento[], pos: PosicionTren[], ahora: number, retrasoPrevio: Map<string, number>): AvisoClave[] {
  const out: AvisoClave[] = [];
  for (const s of segs) {
    const p = pos.find((x) => x.trenId === s.trenId);
    if (!p) continue;
    const enlace = `/mapa?tren=${encodeURIComponent(p.trenId)}`;
    const parada = p.paradas.find((x) => x.estacionId === s.estacionId);
    if (parada && !parada.pasada) {
      const faltan = Math.round((Date.parse(parada.llegada) - ahora) / MIN);
      if (faltan >= 0 && faltan <= s.minutosAntes)
        out.push({
          clave: `llegada:${s.trenId}:${s.estacionId}:${s.minutosAntes}`,
          tipo: "llegada",
          titulo: `${p.tipo} ${p.numero}`,
          texto: faltan === 0 ? `Tu tren está llegando a ${parada.nombre}.` : `Tu tren llega a ${parada.nombre} en ${faltan} min.`,
          enlace,
        });
    }
    const antes = retrasoPrevio.get(s.trenId);
    if (antes !== undefined && antes !== p.retrasoMin)
      out.push({
        clave: `retraso:${s.trenId}:${p.retrasoMin}:${ahora}`,
        tipo: "retraso",
        grave: p.retrasoMin >= 15,
        titulo: `${p.tipo} ${p.numero}`,
        texto: p.retrasoMin === 0 ? "Tu tren ya circula en hora." : `El retraso cambia de ${antes} a ${p.retrasoMin} min.`,
        enlace,
      });
    retrasoPrevio.set(s.trenId, p.retrasoMin);
  }
  return out;
}

// (b) Trenes reservados: retraso REAL del viaje del billete (el de /posiciones, mismo id `feed:tripId`)
// y «embarque abierto» por hora. Cada cambio de retraso es un aviso nuevo.
export function novedadesBillete(b: Billete, ahora: number, pos: PosicionTren[] = []): AvisoClave[] {
  const salida = Date.parse(b.tren.salida);
  const faltan = (salida - ahora) / MIN;
  if (faltan < -240 || faltan > 180) return []; // de 3 h antes de salir hasta 4 h después (va en el tren)
  const titulo = `${b.tren.tipo} ${b.tren.numero} de las ${hora(b.tren.salida)}`;
  const enlace = `/billetes/${encodeURIComponent(b.id)}`;
  const out: AvisoClave[] = [];
  const p = b.tren.id ? pos.find((x) => x.trenId === b.tren.id) : undefined;
  const min = p?.retrasoSeg != null ? Math.round(p.retrasoSeg / 60) : null;
  if (min !== null && min >= 3)
    out.push({ clave: `bil-retraso:${b.id}:${min}`, tipo: "retraso", grave: min >= 15, titulo, texto: `Tu tren va con ${min} min de retraso.`, enlace });
  if (faltan >= 0 && faltan <= 20)
    out.push({ clave: `bil-embarque:${b.id}`, tipo: "info", titulo, texto: `Embarque abierto en ${b.tren.origen.nombre}.`, enlace });
  return out;
}

// (c) Líneas favoritas: próximo tren en menos de 15 min o con retraso.
export function reglasFavorita(trenes: Tren[], pos: PosicionTren[], ahora: number): AvisoClave[] {
  const t = trenes.find((x) => Date.parse(x.salida) > ahora);
  if (!t) return [];
  const out: AvisoClave[] = [];
  const faltan = Math.round((Date.parse(t.salida) - ahora) / MIN);
  const titulo = `${t.origen.nombre} a ${t.destino.nombre}`;
  if (faltan < 15)
    out.push({ clave: `fav:${t.id}`, tipo: "info", titulo, texto: `El ${t.tipo} de las ${hora(t.salida)} sale en ${faltan} min.`, enlace: `/reserva/${encodeURIComponent(t.id)}` });
  const retraso = retrasoDe(t, pos);
  if (retraso > 0)
    out.push({ clave: `fav-retraso:${t.id}:${retraso}`, tipo: "retraso", grave: retraso >= 15, titulo, texto: `El ${t.tipo} de las ${hora(t.salida)} va con ${retraso} min de retraso.`, enlace: "/mapa" });
  return out;
}

// shortcut: cruza por número de tren; con la API real los ids de viaje coincidirán.
export const retrasoDe = (t: Tren, pos: PosicionTren[]) => pos.find((p) => p.numero === t.numero)?.retrasoMin ?? 0;
