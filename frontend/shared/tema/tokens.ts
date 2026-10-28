// Tokens de diseño de la web (frontend/web/src/estilos/base.css) en valores para React Native.
// Fuente de verdad: las variables :root de base.css. tokens.test.ts comprueba que coinciden.
// La web no tiene modo oscuro: no hay tokens oscuros que portar.

/** Paleta base (--morado, --frambuesa…). */
export const paleta = {
  morado: "#81005e",
  moradoOscuro: "#5c0043",
  frambuesa: "#d62d61",
  niebla: "#eff3f6",
  grafito: "#464646",
  gris: "#6b6b6b",
  linea: "#d9dfe5",
  blanco: "#ffffff",
} as const;

/** Colores semánticos (--color-*). Úsalos en vez de la paleta directa. */
export const colores = {
  texto: paleta.grafito,
  textoSuave: paleta.gris,
  titulo: paleta.moradoOscuro,
  marca: paleta.morado,
  accion: paleta.frambuesa,
  accionPulsada: "#b81f50", // --color-accion-hover: en móvil es el estado pressed
  fondo: paleta.niebla,
  superficie: paleta.blanco,
  borde: paleta.linea,
  error: "#a3123f",
  resalte: "#fbe3ec",
  foco: paleta.frambuesa, // :focus-visible usa outline 3px frambuesa
} as const;

/** Tipografía. Tamaños en px (la web usa rem con base 16px). */
export const tipografia = {
  // La web carga "Instrument Sans" con fallback system-ui; en Expo hay que cargarla con expo-font.
  familia: "Instrument Sans",
  familiaMono: "monospace", // solo el panel de revisor (ui-monospace)
  // Escala sacada de los font-size más repetidos del CSS (0.75rem…1.8rem).
  tamanos: {
    xs: 12, // 0.75rem
    sm: 13.6, // 0.85rem, el más usado (24 veces)
    md: 14.4, // 0.9rem
    base: 16, // 1rem
    lg: 17.6, // 1.1rem
    xl: 18.4, // 1.15rem
    xxl: 25.6, // 1.6rem
    titulo: 28.8, // 1.8rem
    // Los títulos de portada usan clamp(2rem, 5vw, 3.2rem): en móvil cae al mínimo.
    portada: 32,
  },
  pesos: {
    normal: "400",
    medio: "500",
    seminegrita: "600",
    negrita: "700",
    extra: "800",
  },
  // RN pide lineHeight en px: multiplica por el tamaño (p. ej. tamanos.base * alturaLinea.normal).
  alturaLinea: {
    compacta: 1,
    titulo: 1.15, // h1, h2
    normal: 1.5, // html
  },
} as const;

/** Espaciado (--esp-*), en px. */
export const espaciado = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
  12: 48,
} as const;

/** Radios (--radio*), en px. */
export const radios = {
  normal: 12,
  grande: 20,
  pildora: 999,
} as const;

/** Orden de capas (--z-*). En RN equivale a zIndex. */
export const capas = {
  panel: 20,
  cabecera: 40,
  modal: 60,
  saltar: 100,
} as const;

type Sombra = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

// shadowRadius = desenfoque CSS / 2. RN no tiene spread (los -12px, -18px… se pierden)
// ni varias capas: se toma la primera. elevation (Android) es aproximada a ojo.
/** Sombras normales (--sombra-*). */
export const sombras = {
  1: { shadowColor: "#28001e", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 1, elevation: 1 },
  2: { shadowColor: "#28001e", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  3: { shadowColor: "#28001e", shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.55, shadowRadius: 20, elevation: 10 },
} as const satisfies Record<number, Sombra>;

/** Efecto cristal: tres niveles de superficie (1 tarjetas, 2 paneles/cabecera, 3 menús). */
export const cristal = {
  fondo: {
    1: "rgba(255,255,255,0.74)",
    2: "rgba(255,255,255,0.84)",
    3: "rgba(255,255,255,0.97)", // casi opaco para leerse sobre el mapa
  },
  borde: "rgba(255,255,255,0.75)",
  // backdrop-filter: blur(18px) saturate(150%) / blur(28px) saturate(170%).
  // RN no tiene backdrop-filter: con expo-blur, intensity no es px; habrá que calibrarlo.
  // La saturación no tiene equivalente.
  desenfoque: { normal: 18, fuerte: 28 },
  // Brillo interior (inset 0 1px 0 blanco 0.9): en RN, un borde superior de 1px.
  brillo: "rgba(255,255,255,0.9)",
  // --cristal-luz es un degradado de borde (150deg); en RN necesita expo-linear-gradient.
  luz: {
    angulo: 150,
    colores: ["rgba(255,255,255,0.95)", "rgba(255,255,255,0.35)", "rgba(214,45,97,0.28)"],
    posiciones: [0, 0.45, 1],
  },
  sombras: {
    1: { shadowColor: "#81005e", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.45, shadowRadius: 15, elevation: 3 },
    2: { shadowColor: "#81005e", shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.55, shadowRadius: 22, elevation: 6 },
    3: { shadowColor: "#5c0043", shadowOffset: { width: 0, height: 28 }, shadowOpacity: 0.6, shadowRadius: 30, elevation: 12 },
  },
} as const satisfies { sombras: Record<number, Sombra> } & Record<string, unknown>;

/** Animación (--dur-*, --curva-*). Duraciones en ms; curvas como [x1, y1, x2, y2] (Easing.bezier). */
export const animacion = {
  duracion: { corta: 160, media: 280, larga: 520 },
  curva: {
    salida: [0.2, 0.8, 0.2, 1],
    muelle: [0.34, 1.56, 0.64, 1],
  },
} as const;

export const tema = { paleta, colores, tipografia, espaciado, radios, capas, sombras, cristal, animacion } as const;
