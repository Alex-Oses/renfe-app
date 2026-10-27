// Tren de alta velocidad estilizado (dibujo propio): cabeza a la derecha, cuatro coches y fuelles.
const COCHE = 250;
const HUECO = 10;
const VENTANAS = [44, 78, 112, 146, 180];

function Bogie({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x="-26" y="120" width="52" height="9" rx="3" fill="#3a3a3a" />
      <circle cx="-14" cy="132" r="9" fill="#464646" />
      <circle cx="14" cy="132" r="9" fill="#464646" />
      <circle cx="-14" cy="132" r="3" fill="#9a9a9a" />
      <circle cx="14" cy="132" r="3" fill="#9a9a9a" />
    </g>
  );
}

function Ventanillas({ lista }: { lista: number[] }) {
  return (
    <>
      {lista.map((v) => (
        <g key={v}>
          <rect x={v} y="50" width="28" height="22" rx="5" fill="url(#tren-cristal)" />
          <path d={`M${v + 4} 68 L${v + 16} 53 H${v + 21} L${v + 9} 68 Z`} fill="#fff" opacity="0.18" />
        </g>
      ))}
    </>
  );
}

function Puerta({ x }: { x: number }) {
  return (
    <g>
      <rect x={x} y="42" width="20" height="62" rx="3" fill="none" stroke="#c9ced4" strokeWidth="1.5" />
      <rect x={x + 5} y="48" width="10" height="18" rx="2" fill="url(#tren-cristal)" />
    </g>
  );
}

function Coche({ x, pantografo }: { x: number; pantografo?: boolean }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x="0" y="30" width={COCHE} height="88" rx="10" fill="url(#tren-caja)" />
      <rect x="0" y="92" width={COCHE} height="8" fill="#d62d61" />
      <rect x="0" y="102" width={COCHE} height="10" fill="#81005e" />
      <rect x="4" y="112" width={COCHE - 8} height="8" rx="2" fill="#5a5a5a" />
      <Puerta x={12} />
      <Puerta x={COCHE - 32} />
      <Ventanillas lista={VENTANAS} />
      <Bogie x={44} />
      <Bogie x={COCHE - 44} />
      {pantografo && (
        <g stroke="#464646" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <rect x="100" y="25" width="50" height="5" rx="2" fill="#5a5a5a" stroke="none" />
          <path d="M110 25 L138 12 L118 2 M140 25 L138 12" />
          <path d="M104 2 H134" strokeWidth="3" />
        </g>
      )}
    </g>
  );
}

function Fuelle({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x="0" y="40" width={HUECO} height="70" fill="#3a3a3a" />
      <path d={`M2 40 V110 M5 40 V110 M8 40 V110`} stroke="#6b6b6b" strokeWidth="1" />
    </g>
  );
}

export function TrenSvg() {
  const paso = COCHE + HUECO;
  const xCabeza = paso * 4;
  return (
    <svg className="tren__svg" viewBox="0 0 1400 145" role="img" aria-label="Tren de alta velocidad">
      <defs>
        <linearGradient id="tren-caja" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#f3f5f7" />
          <stop offset="1" stopColor="#dde2e7" />
        </linearGradient>
        <linearGradient id="tren-cristal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4a1a3f" />
          <stop offset="1" stopColor="#1e0619" />
        </linearGradient>
      </defs>
      <rect x="0" y="138" width="1400" height="4" rx="2" fill="#464646" opacity="0.25" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <Coche x={i * paso} pantografo={i === 1} />
          <Fuelle x={i * paso + COCHE} />
        </g>
      ))}
      {/* Cabeza: morro largo y aerodinámico */}
      <g transform={`translate(${xCabeza} 0)`}>
        <path d="M0 30 H150 C230 34 300 82 316 112 L316 118 H0 Z" fill="url(#tren-caja)" />
        <path d="M0 92 H274 C282 96 287 99 290 100 H0 Z" fill="#d62d61" />
        <path d="M0 102 H294 C302 106 308 109 312 112 H0 Z" fill="#81005e" />
        <path d="M6 112 H312 L300 120 H6 Z" fill="#5a5a5a" />
        {/* Parabrisas curvo con reflejo */}
        <path d="M168 40 C220 44 262 64 282 84 C250 86 214 84 182 80 Z" fill="url(#tren-cristal)" />
        <path d="M186 46 C214 50 236 60 250 70 L240 72 C226 62 206 54 184 52 Z" fill="#fff" opacity="0.2" />
        {/* Faro */}
        <path d="M288 96 C296 98 304 102 308 106 L296 106 Z" fill="#fff6c8" />
        <circle cx="302" cy="104" r="2.5" fill="#fff" />
        <Puerta x={12} />
        <Ventanillas lista={[44, 78, 112]} />
        <Bogie x={44} />
        <Bogie x={210} />
      </g>
    </svg>
  );
}
