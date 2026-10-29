import L from "leaflet";
import { useMemo, useState } from "react";
import { CircleMarker, Marker, Polyline, Tooltip, useMapEvents } from "react-leaflet";
import { ESTACIONES } from "@renfe/shared/api/simulado";
import type { PosicionTren } from "@renfe/shared/api/tipos";
import { COLOR_TIPO } from "./CapaTrenes";
import { extremos } from "./estado-tren";

type LL = [number, number];

// Corta la ruta en el punto más cercano al tren: lo anterior es lo recorrido.
export function partirRuta(ruta: LL[], lat: number, lon: number): { hecho: LL[]; pendiente: LL[] } {
  if (ruta.length < 2) return { hecho: [], pendiente: ruta };
  const k = Math.cos((lat * Math.PI) / 180); // escala de la longitud
  let mejor = { i: 0, d: Infinity, q: ruta[0] };
  for (let i = 0; i < ruta.length - 1; i++) {
    const [a, b] = [ruta[i], ruta[i + 1]];
    const dx = (b[1] - a[1]) * k;
    const dy = b[0] - a[0];
    const l2 = dx * dx + dy * dy || 1e-12;
    const f = Math.max(0, Math.min(1, (((lon - a[1]) * k) * dx + (lat - a[0]) * dy) / l2));
    const q: LL = [a[0] + dy * f, a[1] + (b[1] - a[1]) * f];
    const d = ((q[1] - lon) * k) ** 2 + (q[0] - lat) ** 2;
    if (d < mejor.d) mejor = { i, d, q };
  }
  return { hecho: [...ruta.slice(0, mejor.i + 1), mejor.q], pendiente: [mejor.q, ...ruta.slice(mejor.i + 1)] };
}

export function RutaElegida({ tren }: { tren: PosicionTren }) {
  const c = COLOR_TIPO[tren.tipo];
  const { hecho, pendiente } = partirRuta(tren.ruta, tren.lat, tren.lon);
  // Sin dos puntos no hay línea que pintar: Leaflet avisa si le llega una vacía.
  const linea = (positions: LL[]) => (positions.length > 1 ? positions : undefined);
  const { salida, llegada } = extremos(tren.paradas);
  // Con una sola parada, salida y llegada son la misma: se pinta una vez.
  const extremosDibujo =
    salida && llegada && salida.estacionId === llegada.estacionId
      ? [{ parada: salida, etiqueta: "Parada" }]
      : [
          ...(salida ? [{ parada: salida, etiqueta: "Sale de" }] : []),
          ...(llegada ? [{ parada: llegada, etiqueta: "Llega a" }] : []),
        ];
  return (
    <>
      {linea(hecho) && (
        <Polyline positions={hecho} pathOptions={{ color: c, weight: 4, opacity: 0.35, dashArray: "6 6" }} interactive={false} />
      )}
      {linea(pendiente) && (
        <>
          <Polyline positions={pendiente} pathOptions={{ color: "#fff", weight: 9, opacity: 0.95 }} interactive={false} />
          <Polyline positions={pendiente} pathOptions={{ color: c, weight: 5, opacity: 1 }} interactive={false} />
        </>
      )}
      {tren.paradas.map((p) => {
        // La primera y la última parada se dibujan aparte, con su etiqueta de salida y llegada.
        if (p.estacionId === salida?.estacionId || p.estacionId === llegada?.estacionId) return null;
        return (
          <CircleMarker
            key={p.estacionId}
            center={[p.lat, p.lon]}
            radius={6}
            pathOptions={{ color: c, weight: 3, fillColor: p.pasada ? "#d9dde2" : "#fff", fillOpacity: 1, opacity: p.pasada ? 0.5 : 1 }}
          >
            <Tooltip permanent direction="right" offset={[8, 0]} className={`parada-etiqueta${p.pasada ? " parada-etiqueta--pasada" : ""}`}>
              {p.nombre}
            </Tooltip>
          </CircleMarker>
        );
      })}
      {extremosDibujo.map(({ parada: p, etiqueta }) => (
        <CircleMarker
          key={`extremo-${etiqueta}-${p.estacionId}`}
          center={[p.lat, p.lon]}
          radius={8}
          pathOptions={{ color: c, weight: 3, fillColor: c, fillOpacity: 1 }}
        >
          <Tooltip permanent direction="right" offset={[10, 0]} className="parada-etiqueta parada-etiqueta--extremo">
            {etiqueta} {p.nombre}
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}

// Una línea por recorrido distinto (los dos sentidos cuentan como uno).
export function RutasTodas({ trenes }: { trenes: PosicionTren[] }) {
  const rutas = useMemo(() => {
    const vistas = new Map<string, PosicionTren>();
    for (const t of trenes) {
      const r = t.ruta[0]?.[0] > t.ruta[t.ruta.length - 1]?.[0] ? [...t.ruta].reverse() : t.ruta;
      vistas.set(`${t.tipo}|${r.join(";")}`, t);
    }
    return [...vistas.entries()];
  }, [trenes]);
  return (
    <>
      {rutas.map(([clave, t]) => (
        <Polyline key={clave} positions={t.ruta} pathOptions={{ color: COLOR_TIPO[t.tipo], weight: 2.5, opacity: 0.45 }} interactive={false} />
      ))}
    </>
  );
}

const SVG_ESTACION =
  '<svg viewBox="0 0 22 22" width="22" height="22" aria-hidden="true" focusable="false"><rect x="1" y="1" width="20" height="20" rx="6" fill="#464646" stroke="#fff" stroke-width="2"/><path d="M7.5 5.5h7a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 6 13V7a1.5 1.5 0 0 1 1.5-1.5ZM6 10h10M8.5 17l1-2.5M13.5 17l-1-2.5" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>';
export const iconoEstacion = L.divIcon({ className: "estacion-marca", iconSize: [22, 22], iconAnchor: [11, 11], html: SVG_ESTACION });

// Estaciones principales; la etiqueta (ciudad) solo una vez por ciudad.
export function Estaciones({ etiquetas }: { etiquetas: boolean }) {
  const [zoom, setZoom] = useState(6);
  useMapEvents({ zoomend: (e) => setZoom(e.target.getZoom()) });
  const fija = etiquetas && zoom >= 6;
  const ciudades = new Set<string>();
  return (
    <>
      {ESTACIONES.map((e) => {
        const primera = !ciudades.has(e.ciudad);
        ciudades.add(e.ciudad);
        const permanente = fija && primera;
        return (
          <Marker key={`${e.id}-${permanente}`} position={[e.lat, e.lon]} icon={iconoEstacion} keyboard={false} title={e.nombre}>
            <Tooltip permanent={permanente} direction="top" offset={[0, -10]} className="estacion-etiqueta">
              {permanente ? e.ciudad : e.nombre}
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
}
