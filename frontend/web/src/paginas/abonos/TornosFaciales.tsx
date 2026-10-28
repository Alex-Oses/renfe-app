// Idea de futuro, no es una función real: se explica con un diagrama sencillo.
export function TornosFaciales() {
  return (
    <section className="tarjeta tornos" aria-labelledby="tornos-titulo">
      <p className="tornos__marca">Idea de futuro · no disponible</p>
      <h2 id="tornos-titulo">Próximamente: acceso facial en los tornos</h2>
      <p>
        Queremos que, en las estaciones AVE, los tornos reconozcan tu cara como ya pasa en algunos aeropuertos. Si tienes un
        billete o un abono válido para esa estación, la puerta se abre y entras o sales sin sacar el móvil.
      </p>
      <p>
        Hoy no funciona en ninguna estación. Solo sería para quien lo active, con la huella numérica que ya usas para entrar
        en tu cuenta (nunca fotos), y el QR seguiría valiendo siempre.
      </p>
      <svg className="tornos__diagrama" viewBox="0 0 640 150" role="img" aria-labelledby="tornos-svg-t tornos-svg-d">
        <title id="tornos-svg-t">Cómo funcionaría el acceso facial</title>
        <desc id="tornos-svg-d">
          Tres pasos: la cámara del torno lee tu cara, el sistema comprueba que tienes billete o abono válido para esa
          estación y la puerta se abre.
        </desc>
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="90" cy="55" r="22" />
          <path d="M62 105c4-18 16-26 28-26s24 8 28 26" />
          <rect x="268" y="28" width="104" height="64" rx="10" />
          <path d="M292 60l14 14 28-30" />
          <path d="M500 30v80M580 30v80M520 70h40" />
          <path d="M150 65h90M400 65h80" strokeDasharray="6 6" />
          <path d="M232 57l8 8-8 8M472 57l8 8-8 8" />
        </g>
        <g fill="currentColor" fontSize="15" textAnchor="middle" fontFamily="inherit">
          <text x="90" y="138">1. Te mira la cámara</text>
          <text x="320" y="138">2. Billete o abono válido</text>
          <text x="540" y="138">3. Se abre el torno</text>
        </g>
      </svg>
    </section>
  );
}
