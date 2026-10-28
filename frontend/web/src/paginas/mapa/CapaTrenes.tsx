import L from "leaflet";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import type { PosicionTren, TipoTren } from "@renfe/shared/api/tipos";

export const COLOR_TIPO: Record<TipoTren, string> = {
  AVE: "#81005e",
  Avlo: "#b5489a",
  Alvia: "#1f5fa8",
  Intercity: "#2e7d32",
  "Media Distancia": "#9a5a00",
  Cercanías: "#0e7c86",
  "Larga Distancia": "#5c0043",
};

export const SIGLA_TIPO: Record<TipoTren, string> = {
  AVE: "AVE",
  Avlo: "Avlo",
  Alvia: "Alvia",
  Intercity: "IC",
  "Media Distancia": "MD",
  Cercanías: "C",
  "Larga Distancia": "LD",
};

const INTERVALO = 5000;

// Silueta vista desde arriba, morro hacia el norte (viewBox 0 0 20 36). El morro dice el tipo.
const CUERPO: Record<TipoTren, string> = {
  AVE: "M10 1C14 7 15 11 15 15V35H5V15C5 11 6 7 10 1Z",
  Avlo: "M10 1C14 7 15 11 15 15V35H5V15C5 11 6 7 10 1Z",
  Alvia: "M10 6C13.5 7 15 9 15 12V35H5V12C5 9 6.5 7 10 6Z",
  Intercity: "M10 6C13.5 7 15 9 15 12V35H5V12C5 9 6.5 7 10 6Z",
  "Media Distancia": "M6.5 8H13.5Q15 8 15 10V35H5V10Q5 8 6.5 8Z",
  Cercanías: "M5 9H15Q16 9 16 10V35H4V10Q4 9 5 9Z",
  "Larga Distancia": "M10 6C13.5 7 15 9 15 12V35H5V12C5 9 6.5 7 10 6Z",
};
const CRISTAL: Record<TipoTren, string> = {
  AVE: "M10 8C12 10 12.6 12 12.8 14H7.2C7.4 12 8 10 10 8Z",
  Avlo: "M10 8C12 10 12.6 12 12.8 14H7.2C7.4 12 8 10 10 8Z",
  Alvia: "M7.5 9.5H12.5L13 12.5H7Z",
  Intercity: "M7.5 9.5H12.5L13 12.5H7Z",
  "Media Distancia": "M7 10H13V12.5H7Z",
  Cercanías: "M6 10.5H14V13H6Z",
  "Larga Distancia": "M7.5 9.5H12.5L13 12.5H7Z",
};
// Cercanías: franjas de puertas para que no se confunda con el regional.
const EXTRA: Partial<Record<TipoTren, string>> = {
  Cercanías: '<path d="M4 20H16M4 27H16" stroke="#fff" stroke-width="1.4"/>',
  "Media Distancia": '<path d="M5 24H15" stroke="#fff" stroke-width="1.2"/>',
};

export const svgTren = (tipo: TipoTren) =>
  `<svg viewBox="0 0 20 36" width="20" height="36" aria-hidden="true" focusable="false"><path d="${CUERPO[tipo]}" fill="${COLOR_TIPO[tipo]}" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/><path d="${CRISTAL[tipo]}" fill="#1d2433" opacity=".75"/>${EXTRA[tipo] ?? ""}</svg>`;

// Rumbo entre dos lecturas (el GTFS-RT de Renfe no lo publica). NaN si apenas se ha movido.
const rumboEntre = (a: L.LatLng, b: L.LatLng) => {
  if (a.distanceTo(b) < 30) return NaN;
  const rad = Math.PI / 180;
  const y = Math.sin((b.lng - a.lng) * rad) * Math.cos(b.lat * rad);
  const x = Math.cos(a.lat * rad) * Math.sin(b.lat * rad) - Math.sin(a.lat * rad) * Math.cos(b.lat * rad) * Math.cos((b.lng - a.lng) * rad);
  return (Math.atan2(y, x) / rad + 360) % 360;
};

// Sin rumbo conocido se pinta como punto: un tren mirando al norte por defecto engaña.
const claseMarca = (t: PosicionTren, rumbo: number) =>
  `tren-marca${t.tipo === "Cercanías" ? " tren-marca--cercanias" : ""}${Number.isFinite(rumbo) ? "" : " tren-marca--sin-rumbo"}`;

// Nivel de detalle por zoom para que 600 trenes reales no tapen el mapa (ver mapa.css).
const nivelZoom = (z: number) => (z < 7 ? "lejos" : z < 10 ? "medio" : "cerca");

const icono = (t: PosicionTren, rumbo: number) =>
  L.divIcon({
    className: claseMarca(t, rumbo),
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    html: `<span class="tren-marca__anillo"></span><span class="tren-marca__dibujo" style="transform:rotate(${Number.isFinite(rumbo) ? rumbo : 0}deg)">${svgTren(t.tipo)}</span><span class="tren-marca__punto" style="background:${COLOR_TIPO[t.tipo]}"></span>`,
  });

interface Marca {
  m: L.Marker;
  desde: L.LatLng;
  hasta: L.LatLng;
  rumbo: number;
}

// Marcadores imperativos: así la interpolación solo mueve el transform que pone Leaflet, sin re-render de React.
export function CapaTrenes({
  trenes,
  seleccion,
  siguiendo,
  reducido,
  alElegir,
}: {
  trenes: PosicionTren[];
  seleccion: string | null;
  siguiendo: boolean;
  reducido: boolean;
  alElegir: (id: string) => void;
}) {
  const mapa = useMap();
  const marcas = useRef(new Map<string, Marca>());
  const inicio = useRef(0);
  const elegir = useRef(alElegir);
  elegir.current = alElegir;

  useEffect(() => {
    const vivos = new Set(trenes.map((t) => t.trenId));
    for (const [id, x] of marcas.current) {
      if (!vivos.has(id)) {
        x.m.remove();
        marcas.current.delete(id);
      }
    }
    for (const t of trenes) {
      const destino = L.latLng(t.lat, t.lon);
      const x = marcas.current.get(t.trenId);
      if (!x) {
        const m = L.marker(destino, { icon: icono(t, t.rumbo), title: `Tren ${t.tipo} ${t.numero}`, keyboard: false }).addTo(mapa);
        m.on("click", () => elegir.current(t.trenId));
        marcas.current.set(t.trenId, { m, desde: destino, hasta: destino, rumbo: t.rumbo });
      } else {
        x.desde = x.m.getLatLng();
        const calculado = Number.isFinite(t.rumbo) ? t.rumbo : rumboEntre(x.hasta, destino);
        if (Number.isFinite(calculado)) x.rumbo = calculado;
        x.hasta = destino;
        const el = x.m.getElement();
        el?.classList.toggle("tren-marca--sin-rumbo", !Number.isFinite(x.rumbo));
        const dibujo = el?.querySelector<HTMLElement>(".tren-marca__dibujo");
        if (dibujo && Number.isFinite(x.rumbo)) dibujo.style.transform = `rotate(${x.rumbo}deg)`;
        if (reducido) x.m.setLatLng(destino);
      }
    }
    inicio.current = performance.now();
  }, [trenes, mapa, reducido]);

  useEffect(() => {
    const contenedor = mapa.getContainer();
    const aplicar = () => (contenedor.dataset.detalle = nivelZoom(mapa.getZoom()));
    aplicar();
    mapa.on("zoomend", aplicar);
    return () => void mapa.off("zoomend", aplicar);
  }, [mapa]);

  useEffect(() => () => {
    for (const x of marcas.current.values()) x.m.remove();
    marcas.current.clear();
  }, []);

  useEffect(() => {
    for (const [id, x] of marcas.current) x.m.getElement()?.classList.toggle("tren-marca--activa", id === seleccion);
  }, [seleccion, trenes]);

  // Seguir al tren elegido: vuela al elegirlo y luego acompaña cada lectura.
  const ultimo = useRef<string | null>(null);
  useEffect(() => {
    const t = trenes.find((x) => x.trenId === seleccion);
    if (!t || !siguiendo) {
      ultimo.current = null;
      return;
    }
    const p = L.latLng(t.lat, t.lon);
    if (ultimo.current !== seleccion) {
      ultimo.current = seleccion;
      if (reducido) mapa.setView(p, Math.max(mapa.getZoom(), 8), { animate: false });
      else mapa.flyTo(p, Math.max(mapa.getZoom(), 8), { duration: 1.2 });
    } else {
      mapa.panTo(p, reducido ? { animate: false } : { animate: true, duration: INTERVALO / 1000, easeLinearity: 1 });
    }
  }, [trenes, seleccion, siguiendo, reducido, mapa]);

  useEffect(() => {
    if (reducido) return;
    let id = 0;
    const paso = (ahora: number) => {
      const f = Math.min(1, (ahora - inicio.current) / INTERVALO);
      for (const x of marcas.current.values()) {
        x.m.setLatLng([x.desde.lat + (x.hasta.lat - x.desde.lat) * f, x.desde.lng + (x.hasta.lng - x.desde.lng) * f]);
      }
      id = requestAnimationFrame(paso);
    };
    id = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(id);
  }, [reducido]);

  return null;
}
