import Svg, { Path, Rect } from "react-native-svg";

// Símbolo de estación principal, el mismo SVG_ESTACION de la web (CapasRuta.tsx).
export function SimboloEstacion({ tamano = 20 }: { tamano?: number }) {
  return (
    <Svg viewBox="0 0 22 22" width={tamano} height={tamano}>
      <Rect x={1} y={1} width={20} height={20} rx={6} fill="#464646" stroke="#fff" strokeWidth={2} />
      <Path
        d="M7.5 5.5h7a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 6 13V7a1.5 1.5 0 0 1 1.5-1.5ZM6 10h10M8.5 17l1-2.5M13.5 17l-1-2.5"
        fill="none"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}
