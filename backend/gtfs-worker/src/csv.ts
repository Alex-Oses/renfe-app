/**
 * Lector CSV mínimo (RFC 4180) con las tolerancias que exigen los ficheros de Renfe.
 *
 * Los GTFS de Renfe **rellenan cada línea con espacios** hasta un ancho fijo, así
 * que el último campo llega con cola de espacios: se recorta siempre. También se
 * acepta `;` como separador, porque `estaciones.csv` no es un feed GTFS.
 */

export interface OpcionesCsv {
  /** Separador de campos. Por defecto `,` (GTFS). `estaciones.csv` usa `;`. */
  separador?: string;
  /** Carácter de comillas. Por defecto `"`. */
  comillas?: string;
}

/** Recorre las líneas de un CSV devolviendo arrays de campos ya recortados. */
export function* lineasCsv(texto: string, opciones: OpcionesCsv = {}): Generator<string[]> {
  const separador = opciones.separador ?? ",";
  const comillas = opciones.comillas ?? '"';
  let campo = "";
  let campos: string[] = [];
  let dentroDeComillas = false;
  let i = 0;

  while (i < texto.length) {
    const caracter = texto[i] ?? "";

    if (dentroDeComillas) {
      if (caracter === comillas) {
        if (texto[i + 1] === comillas) {
          campo += comillas;
          i += 2;
          continue;
        }
        dentroDeComillas = false;
        i += 1;
        continue;
      }
      campo += caracter;
      i += 1;
      continue;
    }

    if (caracter === comillas) {
      dentroDeComillas = true;
      i += 1;
      continue;
    }
    if (caracter === separador) {
      campos.push(campo);
      campo = "";
      i += 1;
      continue;
    }
    if (caracter === "\n" || caracter === "\r") {
      if (caracter === "\r" && texto[i + 1] === "\n") i += 1;
      campos.push(campo);
      yield campos;
      campos = [];
      campo = "";
      i += 1;
      continue;
    }
    campo += caracter;
    i += 1;
  }

  if (campo !== "" || campos.length > 0) {
    campos.push(campo);
    yield campos;
  }
}

/**
 * Igual que `lineasCsv`, pero la primera línea es la cabecera y cada fila sale ya
 * como objeto. Se saltan las líneas totalmente vacías (el relleno de Renfe deja
 * líneas de solo espacios al final de algunos ficheros).
 */
export function* registrosCsv(
  texto: string,
  opciones: OpcionesCsv = {},
): Generator<Record<string, string>> {
  let cabecera: string[] | null = null;
  for (const campos of lineasCsv(texto, opciones)) {
    const valores = campos.map((valor) => valor.trim());
    if (cabecera === null) {
      cabecera = valores;
      continue;
    }
    if (valores.every((valor) => valor === "")) continue;
    const registro: Record<string, string> = {};
    for (let i = 0; i < cabecera.length; i += 1) {
      const clave = cabecera[i];
      if (clave === undefined || clave === "") continue;
      registro[clave] = valores[i] ?? "";
    }
    yield registro;
  }
}
