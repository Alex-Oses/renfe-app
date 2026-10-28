/**
 * Lectura de `estaciones.csv`, el CSV de estaciones de Renfe (contrato §4.1).
 *
 * No es un feed GTFS: viene en **latin-1** y separado por **`;`**, con todos los
 * campos entre comillas y algunos con espacios de relleno. Es la fuente canónica
 * del `estaciones.id` (= `CODIGO`), que comparten el CSV y los dos GTFS.
 */
import { registrosCsv } from "../csv.js";

export interface FilaEstacion {
  id: string;
  nombre: string;
  ciudad: string | null;
  provincia: string | null;
  lat: number;
  lon: number;
  accesible: boolean | null;
}

export interface ResultadoEstaciones {
  estaciones: FilaEstacion[];
  /** Filas descartadas, con el motivo, para el informe de la importación. */
  descartadas: Array<{ codigo: string; motivo: string }>;
}

/** Columnas que se importan; el resto (`DIRECION`, `CP`, `PAIS`…) se descarta. */
const COLUMNAS = ["CODIGO", "DESCRIPCION", "LATITUD", "LONGITUD", "POBLACION", "PROVINCIA"] as const;

export function leerEstacionesCsv(datos: Buffer): ResultadoEstaciones {
  const texto = new TextDecoder("latin1").decode(datos);
  const estaciones: FilaEstacion[] = [];
  const descartadas: Array<{ codigo: string; motivo: string }> = [];
  const vistos = new Set<string>();

  for (const registro of registrosCsv(texto, { separador: ";" })) {
    const codigo = (registro["CODIGO"] ?? "").trim();
    if (codigo === "") {
      // Líneas de relleno al final del fichero y filas sin código: no sirven de nada.
      const rellena = COLUMNAS.every((columna) => (registro[columna] ?? "").trim() === "");
      if (!rellena) descartadas.push({ codigo, motivo: "sin CODIGO" });
      continue;
    }
    if (vistos.has(codigo)) {
      descartadas.push({ codigo, motivo: "CODIGO repetido" });
      continue;
    }

    const nombre = (registro["DESCRIPCION"] ?? "").trim();
    const lat = Number((registro["LATITUD"] ?? "").trim());
    const lon = Number((registro["LONGITUD"] ?? "").trim());
    if (nombre === "") {
      descartadas.push({ codigo, motivo: "sin DESCRIPCION" });
      continue;
    }
    // `lon = 0` es válido (hay estaciones en el meridiano de Greenwich); lo que no
    // vale es (0, 0), que es lo que publica Renfe cuando no tiene la coordenada.
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      Math.abs(lat) > 90 ||
      Math.abs(lon) > 180 ||
      (lat === 0 && lon === 0)
    ) {
      descartadas.push({ codigo, motivo: "coordenadas no válidas" });
      continue;
    }

    vistos.add(codigo);
    estaciones.push({
      id: codigo,
      nombre,
      ciudad: vacioANulo(registro["POBLACION"]),
      provincia: vacioANulo(registro["PROVINCIA"]),
      lat,
      lon,
      accesible: null, // el CSV no lo trae; se rellena desde `stops.txt`
    });
  }

  return { estaciones, descartadas };
}

function vacioANulo(valor: string | undefined): string | null {
  const limpio = (valor ?? "").trim();
  return limpio === "" ? null : limpio;
}
