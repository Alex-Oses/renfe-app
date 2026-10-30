import Svg, { Circle, Line, Path, Rect } from "react-native-svg";

// Trazos de 24x24 tomados de la web (Cabecera, MisBilletes y cuenta) para que la app
// use exactamente los mismos iconos que la versión de escritorio.
const TRAZOS = {
  comprar: "M4 9V6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3a2 2 0 0 0 0 4v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a2 2 0 0 0 0-4zM14 5v12",
  mapa: "M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  billetes: "M7 3h10a1 1 0 0 1 1 1v16l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1zM9 8h6M9 12h6",
  lineas: "M6 4v16M18 4v16M6 8h12M6 16h12",
  cuenta: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
  campana: "M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M10.3 21a2 2 0 0 0 3.4 0",
  menu: "M4 7h16M4 12h16M4 17h16",
  cerrar: "M6 6l12 12M18 6 6 18",
  intercambiar: "M7 4v13m0 0-3-3m3 3 3-3M17 20V7m0 0-3 3m3-3 3 3",
  calendario: "M4 5h16v16H4zM8 3v4M16 3v4M4 10h16",
  chevron: "m6 9 6 6 6-6",
  ojo: "M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  ojoCerrado: "M3 3l18 18M10.6 6.2A9.7 9.7 0 0 1 12 6c6.4 0 10 6 10 6a16 16 0 0 1-3.1 3.7M6.1 6.1C3.4 8 2 12 2 12s3.6 6 10 6a9.6 9.6 0 0 0 4-.9",
  atras: "M15 18l-6-6 6-6",
  delante: "M9 6l6 6-6 6",
  check: "M5 12.5l4.5 4.5L19 7.5",
  aviso: "M12 3 2 20h20L12 3zM12 10v4M12 17h.01",
  cara: "M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M9 10v1M15 10v1M9.5 15.5a3.5 3.5 0 0 0 5 0",
  estrella: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9z",
  basura: "M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13",
  mas: "M12 5v14M5 12h14",
  menos: "M5 12h14",
  refrescar: "M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6",
  reloj: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01",
  tren: "M7 3h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM5 11h14M9 7h6M8 17l-2 4M16 17l2 4M9 14h.01M15 14h.01",
} as const;

export type NombreIcono = keyof typeof TRAZOS;

export function Icono({
  nombre,
  tamano = 24,
  color = "#81005e",
  grosor = 1.8,
}: {
  nombre: NombreIcono;
  tamano?: number;
  color?: string;
  grosor?: number;
}) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none">
      <Path
        d={TRAZOS[nombre]}
        stroke={color}
        strokeWidth={grosor}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

// Icono de billete grande para los estados vacíos (como el de MisBilletes de la web).
export function IconoBilleteGrande({ tamano = 56, color = "#81005e" }: { tamano?: number; color?: string }) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Line x1="14" y1="6" x2="14" y2="18" stroke={color} strokeWidth={1.5} strokeDasharray="2 2" />
    </Svg>
  );
}

// Pequeña silueta de tren vista desde arriba, la misma de la capa de trenes de la web.
export function TrenMarcador({ tipo, tamano = 26 }: { tipo: keyof typeof colorTipo; tamano?: number }) {
  const color = colorTipo[tipo];
  return (
    <Svg width={tamano} height={tamano * 1.7} viewBox="0 0 20 36">
      <Path
        d="M10 1C14 7 15 11 15 15V35H5V15C5 11 6 7 10 1Z"
        fill={color}
        stroke="#fff"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path d="M10 8C12 10 12.6 12 12.8 14H7.2C7.4 12 8 10 10 8Z" fill="#1d2433" opacity={0.75} />
      {tipo === "Cercanías" ? (
        <>
          <Line x1="4" y1="20" x2="16" y2="20" stroke="#fff" strokeWidth={1.4} />
          <Line x1="4" y1="27" x2="16" y2="27" stroke="#fff" strokeWidth={1.4} />
        </>
      ) : null}
    </Svg>
  );
}

import { colorTipo } from "@/tema";

// Círculo con la cifra, para los pasos de la reserva y los contadores.
export function Insignia({ texto, color = "#81005e" }: { texto: string; color?: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={11} fill={color} />
    </Svg>
  );
}
