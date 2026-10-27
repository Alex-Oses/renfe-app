// Tren de alta velocidad estilizado: cabeza a la derecha (sentido de la marcha), cuatro coches.
const COCHE = 260;
const VENTANAS = [20, 62, 104, 146, 188];

function Coche({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x="0" y="30" width={COCHE - 6} height="86" rx="10" fill="#fff" />
      <rect x="0" y="92" width={COCHE - 6} height="9" fill="#d62d61" />
      <rect x="0" y="104" width={COCHE - 6} height="12" fill="#81005e" />
      {VENTANAS.map((v) => (
        <rect key={v} x={v} y="50" width="34" height="22" rx="5" fill="#2b0a24" opacity="0.85" />
      ))}
      <rect x="226" y="44" width="16" height="44" rx="4" fill="#81005e" opacity="0.25" />
      <circle cx="44" cy="122" r="11" fill="#464646" />
      <circle cx="210" cy="122" r="11" fill="#464646" />
    </g>
  );
}

export function TrenSvg() {
  return (
    <svg className="tren__svg" viewBox="0 0 1300 140" role="img" aria-label="Tren de alta velocidad">
      <Coche x={0} />
      <Coche x={COCHE} />
      <Coche x={COCHE * 2} />
      <Coche x={COCHE * 3} />
      {/* Cabeza aerodinámica */}
      <path d="M1040 30 H1150 C1230 34 1290 80 1296 116 H1040 Z" fill="#fff" />
      <path d="M1040 92 H1262 C1268 96 1272 100 1274 104 H1040 Z" fill="#d62d61" />
      <path d="M1040 104 H1276 C1280 108 1286 112 1296 116 H1040 Z" fill="#81005e" />
      <path d="M1150 42 C1200 46 1238 62 1256 82 H1166 Z" fill="#2b0a24" opacity="0.9" />
      {VENTANAS.slice(0, 3).map((v) => (
        <rect key={v} x={1040 + v} y="50" width="34" height="22" rx="5" fill="#2b0a24" opacity="0.85" />
      ))}
      <circle cx="1084" cy="122" r="11" fill="#464646" />
      <circle cx="1230" cy="122" r="11" fill="#464646" />
      <path d="M1210 20 L1250 4 M1190 20 L1230 4" stroke="#464646" strokeWidth="3" />
    </svg>
  );
}
