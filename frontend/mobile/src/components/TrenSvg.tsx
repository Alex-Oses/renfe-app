import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { View } from "react-native";

// Tren de alta velocidad estilizado de la portada de la web (TrenSvg.tsx), dibujado con
// react-native-svg para que se vea igual en iOS y Android.
const COCHE = 250;
const HUECO = 10;
const VENTANAS = [44, 78, 112, 146, 180];

function Bogie({ x }: { x: number }) {
  return (
    <G transform={`translate(${x} 0)`}>
      <Rect x={-26} y={120} width={52} height={9} rx={3} fill="#3a3a3a" />
      <Circle cx={-14} cy={132} r={9} fill="#464646" />
      <Circle cx={14} cy={132} r={9} fill="#464646" />
      <Circle cx={-14} cy={132} r={3} fill="#9a9a9a" />
      <Circle cx={14} cy={132} r={3} fill="#9a9a9a" />
    </G>
  );
}

function Ventanillas({ lista }: { lista: number[] }) {
  return (
    <>
      {lista.map((v) => (
        <G key={v}>
          <Rect x={v} y={50} width={28} height={22} rx={5} fill="url(#trenCristal)" />
          <Path d={`M${v + 4} 68 L${v + 16} 53 H${v + 21} L${v + 9} 68 Z`} fill="#fff" opacity={0.18} />
        </G>
      ))}
    </>
  );
}

function Puerta({ x }: { x: number }) {
  return (
    <G>
      <Rect x={x} y={42} width={20} height={62} rx={3} fill="none" stroke="#c9ced4" strokeWidth={1.5} />
      <Rect x={x + 5} y={48} width={10} height={18} rx={2} fill="url(#trenCristal)" />
    </G>
  );
}

function Coche({ x, pantografo }: { x: number; pantografo?: boolean }) {
  return (
    <G transform={`translate(${x} 0)`}>
      <Rect x={0} y={30} width={COCHE} height={88} rx={10} fill="url(#trenCaja)" />
      <Rect x={0} y={92} width={COCHE} height={8} fill="#d62d61" />
      <Rect x={0} y={102} width={COCHE} height={10} fill="#81005e" />
      <Rect x={4} y={112} width={COCHE - 8} height={8} rx={2} fill="#5a5a5a" />
      <Puerta x={12} />
      <Puerta x={COCHE - 32} />
      <Ventanillas lista={VENTANAS} />
      <Bogie x={44} />
      <Bogie x={COCHE - 44} />
      {pantografo ? (
        <G stroke="#464646" strokeWidth={2.5} fill="none" strokeLinecap="round">
          <Rect x={100} y={25} width={50} height={5} rx={2} fill="#5a5a5a" stroke="none" />
          <Path d="M110 25 L138 12 L118 2 M140 25 L138 12" />
          <Path d="M104 2 H134" strokeWidth={3} />
        </G>
      ) : null}
    </G>
  );
}

function Fuelle({ x }: { x: number }) {
  return (
    <G transform={`translate(${x} 0)`}>
      <Rect x={0} y={40} width={HUECO} height={70} fill="#3a3a3a" />
      <Path d="M2 40 V110 M5 40 V110 M8 40 V110" stroke="#6b6b6b" strokeWidth={1} />
    </G>
  );
}

export function TrenSvg({ ancho = 620 }: { ancho?: number }) {
  const alto = (ancho * 145) / 1400;
  const paso = COCHE + HUECO;
  const xCabeza = paso * 4;
  return (
    <View style={{ width: ancho, height: alto }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={ancho} height={alto} viewBox="0 0 1400 145">
        <Defs>
          <LinearGradient id="trenCaja" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#ffffff" />
            <Stop offset="0.7" stopColor="#f3f5f7" />
            <Stop offset="1" stopColor="#dde2e7" />
          </LinearGradient>
          <LinearGradient id="trenCristal" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#4a1a3f" />
            <Stop offset="1" stopColor="#1e0619" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={138} width={1400} height={4} rx={2} fill="#464646" opacity={0.25} />
        {[0, 1, 2, 3].map((i) => (
          <G key={i}>
            <Coche x={i * paso} pantografo={i === 1} />
            <Fuelle x={i * paso + COCHE} />
          </G>
        ))}
        <G transform={`translate(${xCabeza} 0)`}>
          <Path d="M0 30 H150 C230 34 300 82 316 112 L316 118 H0 Z" fill="url(#trenCaja)" />
          <Path d="M0 92 H274 C282 96 287 99 290 100 H0 Z" fill="#d62d61" />
          <Path d="M0 102 H294 C302 106 308 109 312 112 H0 Z" fill="#81005e" />
          <Path d="M6 112 H312 L300 120 H6 Z" fill="#5a5a5a" />
          <Path d="M168 40 C220 44 262 64 282 84 C250 86 214 84 182 80 Z" fill="url(#trenCristal)" />
          <Path d="M186 46 C214 50 236 60 250 70 L240 72 C226 62 206 54 184 52 Z" fill="#fff" opacity={0.2} />
          <Path d="M288 96 C296 98 304 102 308 106 L296 106 Z" fill="#fff6c8" />
          <Circle cx={302} cy={104} r={2.5} fill="#fff" />
          <Puerta x={12} />
          <Ventanillas lista={[44, 78, 112]} />
          <Bogie x={44} />
          <Bogie x={210} />
        </G>
      </Svg>
    </View>
  );
}
