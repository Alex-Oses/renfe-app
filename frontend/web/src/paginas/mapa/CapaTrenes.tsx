import L from "leaflet";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import type { PosicionTren, TipoTren } from "../../api/tipos";

export const COLOR_TIPO: Record<TipoTren, string> = {
  AVE: "#81005e",
  Avlo: "#d62d61",
  Alvia: "#1f5fa8",
  Intercity: "#2e7d32",
  "Media Distancia": "#9a5a00",
};

const INTERVALO = 5000;

const icono = (t: PosicionTren) =>
  L.divIcon({
    className: "tren-marca",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    html: `<span class="tren-marca__anillo"></span><span class="tren-marca__flecha" style="--c:${COLOR_TIPO[t.tipo]};transform:rotate(${t.rumbo}deg)"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M12 2 20 21 12 16.5 4 21Z" fill="currentColor" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg></span>`,
  });

interface Marca {
  m: L.Marker;
  desde: L.LatLng;
  hasta: L.LatLng;
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
        const m = L.marker(destino, { icon: icono(t), title: `Tren ${t.tipo} ${t.numero}`, keyboard: false }).addTo(mapa);
        m.on("click", () => elegir.current(t.trenId));
        marcas.current.set(t.trenId, { m, desde: destino, hasta: destino });
      } else {
        x.desde = x.m.getLatLng();
        x.hasta = destino;
        const flecha = x.m.getElement()?.querySelector<HTMLElement>(".tren-marca__flecha");
        if (flecha) flecha.style.transform = `rotate(${t.rumbo}deg)`;
        if (reducido) x.m.setLatLng(destino);
      }
    }
    inicio.current = performance.now();
  }, [trenes, mapa, reducido]);

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
