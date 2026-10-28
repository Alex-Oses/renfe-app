// Contrato de las páginas de contenido (secciones informativas tipo renfe.com).
// Cada sección exporta `paginas: Pagina[]`; PaginaContenido las pinta por bloques.

/** Foto opcional: archivo de Wikimedia Commons (o URL) y crédito "autor, licencia". */
export type ConImagen = { imagen?: string; autor?: string };

export type Tarjeta = { titulo: string; texto: string; enlace?: string; etiqueta?: string } & ConImagen;

export type Bloque =
  | { tipo: "texto"; titulo?: string; parrafos: string[] }
  | { tipo: "lista"; titulo?: string; items: string[] }
  | { tipo: "tarjetas"; titulo?: string; tarjetas: Tarjeta[] }
  | { tipo: "tabla"; titulo?: string; columnas: string[]; filas: string[][] }
  | { tipo: "faq"; titulo?: string; preguntas: { p: string; r: string }[] }
  | { tipo: "pasos"; titulo?: string; pasos: { titulo: string; texto: string }[] }
  | { tipo: "aviso"; nivel: "info" | "alerta"; texto: string }
  | { tipo: "cta"; texto: string; enlace: string; etiqueta: string }
  // Widget interactivo registrado en componentes/herramientas/registro.tsx
  | { tipo: "herramienta"; id: string };

export type Pagina = {
  /** Ruta de la app, sin prefijo de idioma. Ej.: "/viajar/informacion-util/mascotas" */
  ruta: string;
  titulo: string;
  /** Una o dos frases para la cabecera y las tarjetas que enlazan aquí */
  resumen: string;
  /** Primer segmento de la ruta: viajar, inspirate, cercanias, gestiona, ayuda, mas-renfe, legal */
  seccion: string;
  bloques: Bloque[];
} & ConImagen;
