// Markdown mínimo para las respuestas del chatbot: párrafos, listas con viñeta y **negrita**.
// No se añade una librería de Markdown para esto; si algún día hace falta más (tablas, enlaces),
// se sustituye este fichero por `react-markdown`.
export interface Bloque {
  tipo: "parrafo" | "lista";
  lineas: string[];
}

export interface Trozo {
  texto: string;
  negrita: boolean;
}

const VINETA = /^\s*[-*•]\s+/;

export function bloques(texto: string): Bloque[] {
  const salida: Bloque[] = [];
  let actual: Bloque | undefined;

  for (const linea of texto.split(/\r?\n/)) {
    const vineta = VINETA.test(linea);
    // Línea en blanco: cierra el bloque abierto (el siguiente párrafo o lista empieza otro).
    if (!vineta && !linea.trim()) {
      actual = undefined;
      continue;
    }
    const tipo = vineta ? "lista" : "parrafo";
    if (actual?.tipo !== tipo) {
      actual = { tipo, lineas: [] };
      salida.push(actual);
    }
    actual.lineas.push(vineta ? linea.replace(VINETA, "") : linea.trim());
  }

  return salida;
}

/** Alterna texto normal y negrita (`**esto**`); la cursiva (`*esto*`) se pinta sin los asteriscos. */
export function enfasis(linea: string): Trozo[] {
  return linea
    .split("**")
    .flatMap((trozo, i) =>
      i % 2 === 1
        ? [{ texto: trozo, negrita: true }]
        : trozo.split("*").map((texto) => ({ texto, negrita: false })),
    )
    .filter((trozo) => trozo.texto.length > 0);
}
