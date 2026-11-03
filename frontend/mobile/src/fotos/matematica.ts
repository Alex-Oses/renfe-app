// Matemática del facial, separada de la cámara y de ONNX para poder probarla con `node --test`
// (ver matematica.test.mjs). Es la misma que la web: alineado por semejanza a 112×112 con los
// puntos de InsightFace y normalización de ArcFace (ADR-007).

export const LADO = 112; // lado del recorte que entra en ArcFace
export const LADO_DET = 640; // lado del cuadrado que recibe SCRFD
export const PASOS = [8, 16, 32];
export const UMBRAL_DET = 0.5; // el por defecto de insightface
export const UMBRAL_NMS = 0.4;

export type Punto = [number, number];
export type Caja = { x1: number; y1: number; x2: number; y2: number };
export type Deteccion = { puntos: Punto[]; score: number; caja: Caja };

/** Puntos de referencia de ArcFace en 112×112: ojo izq., ojo der., nariz, boca izq., boca der. */
export const REFERENCIA: Punto[] = [
  [38.2946, 51.6963],
  [73.5318, 51.5014],
  [56.0252, 71.7366],
  [41.5493, 92.3655],
  [70.7299, 92.2041],
];

export function normalizar(v: ArrayLike<number>): number[] {
  const norma = Math.hypot(...Array.from(v)) || 1;
  return Array.from(v, (x) => x / norma);
}

/**
 * Semejanza (escala + giro + traslación) que mejor lleva `origen` a `destino` por mínimos cuadrados
 * (Umeyama en 2D). Devuelve [a, b, tx, ty] con x' = a·x − b·y + tx, y' = b·x + a·y + ty.
 */
export function semejanza(origen: Punto[], destino: Punto[]): [number, number, number, number] {
  const n = origen.length;
  const mo = origen.reduce((s, p) => [s[0] + p[0] / n, s[1] + p[1] / n], [0, 0]);
  const md = destino.reduce((s, p) => [s[0] + p[0] / n, s[1] + p[1] / n], [0, 0]);
  let sxx = 0;
  let sxy = 0;
  let varianza = 0;
  origen.forEach((p, i) => {
    const [ox, oy] = [p[0] - mo[0], p[1] - mo[1]];
    const [dx, dy] = [destino[i]![0] - md[0], destino[i]![1] - md[1]];
    sxx += ox * dx + oy * dy;
    sxy += ox * dy - oy * dx;
    varianza += ox * ox + oy * oy;
  });
  const a = sxx / varianza;
  const b = sxy / varianza;
  return [a, b, md[0] - (a * mo[0] - b * mo[1]), md[1] - (b * mo[0] + a * mo[1])];
}

/**
 * Foto RGBA → lienzo 640×640 en CHW con la normalización de SCRFD (mean 127.5, std 128): se escala
 * para caber y el resto se rellena de negro. Devuelve la escala para volver a las coordenadas de foto.
 */
export function preparar(foto: Uint8Array, ancho: number, alto: number): { escala: number; lienzo: Float32Array } {
  const rel = alto / ancho;
  const altoLienzo = rel > 1 ? LADO_DET : Math.round(LADO_DET * rel);
  const anchoLienzo = rel > 1 ? Math.round(LADO_DET / rel) : LADO_DET;
  const escala = altoLienzo / alto;
  const lienzo = new Float32Array(3 * LADO_DET * LADO_DET);
  const canal = LADO_DET * LADO_DET;
  const paso = 4 * ancho;
  for (let y = 0; y < altoLienzo; y++) {
    // Muestreo punto medio: al escalar se coge el píxel de la foto que cae en el centro.
    const sy = Math.min(alto - 1, Math.floor((y + 0.5) / escala));
    for (let x = 0; x < anchoLienzo; x++) {
      const sx = Math.min(ancho - 1, Math.floor((x + 0.5) / escala));
      const i = (sy * ancho + sx) * paso;
      const d = y * LADO_DET + x;
      lienzo[d] = (foto[i] - 127.5) / 128;
      lienzo[canal + d] = (foto[i + 1] - 127.5) / 128;
      lienzo[2 * canal + d] = (foto[i + 2] - 127.5) / 128;
    }
  }
  return { escala, lienzo };
}

/**
 * Salidas de SCRFD → rejillas por forma. Los nombres no son fijos (443, 446…) así que se agrupan
 * por sus dimensiones: (n,1) puntuaciones, (n,4) cajas y (n,10) puntos, con n = lado² · 2 anclas.
 */
export function agrupar(salidas: { dims: readonly number[]; data: Float32Array }[]): Map<string, Float32Array> {
  const mapa = new Map<string, Float32Array>();
  for (const s of salidas) if (s.dims.length === 2) mapa.set(`${s.dims[0]}x${s.dims[1]}`, s.data);
  return mapa;
}

/** Caja y puntos de la cara de mayor puntuación (con NMS), en coordenadas de foto. `null` si no hay. */
export function decodificar(mapa: Map<string, Float32Array>, escala: number): Deteccion | null {
  const candidatos: (Caja & { score: number; puntos: Punto[] })[] = [];
  for (const paso of PASOS) {
    const lado = LADO_DET / paso;
    const n = lado * lado * 2; // 2 anclas por celda (las de insightface para stride 8/16/32)
    const puntajes = mapa.get(`${n}x1`);
    const cajas = mapa.get(`${n}x4`);
    const puntos = mapa.get(`${n}x10`);
    if (!puntajes || !cajas || !puntos) continue;
    for (let i = 0; i < puntajes.length; i++) {
      if (puntajes[i] < UMBRAL_DET) continue;
      const loc = Math.floor(i / 2);
      const cx = (loc % lado) * paso;
      const cy = Math.floor(loc / lado) * paso;
      const k: Punto[] = [];
      for (let j = 0; j < 5; j++)
        k.push([(cx + puntos[i * 10 + 2 * j] * paso) / escala, (cy + puntos[i * 10 + 2 * j + 1] * paso) / escala]);
      candidatos.push({
        x1: (cx - cajas[i * 4] * paso) / escala,
        y1: (cy - cajas[i * 4 + 1] * paso) / escala,
        x2: (cx + cajas[i * 4 + 2] * paso) / escala,
        y2: (cy + cajas[i * 4 + 3] * paso) / escala,
        score: puntajes[i],
        puntos: k,
      });
    }
  }
  if (!candidatos.length) return null;
  candidatos.sort((a, b) => b.score - a.score);

  const buenas: typeof candidatos = [];
  for (const c of candidatos) {
    if (buenas.every((b) => iou(c, b) <= UMBRAL_NMS)) buenas.push(c);
    if (buenas.length === 1) break;
  }
  const mejor = buenas[0]!;
  return {
    score: mejor.score,
    caja: { x1: mejor.x1, y1: mejor.y1, x2: mejor.x2, y2: mejor.y2 },
    puntos: mejor.puntos,
  };
}

function iou(a: Caja, b: Caja): number {
  const ix = Math.max(0, Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1));
  const iy = Math.max(0, Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1));
  const inter = ix * iy;
  return inter / ((a.x2 - a.x1) * (a.y2 - a.y1) + (b.x2 - b.x1) * (b.y2 - b.y1) - inter);
}

/** Cara a 112×112 (por la inversa de la semejanza, igual que el canvas de la web) → NCHW en [−1, 1]. */
export function recortar(foto: Uint8Array, ancho: number, alto: number, puntos: Punto[]): Float32Array {
  const [a, b, tx, ty] = semejanza(puntos, REFERENCIA);
  const det = a * a + b * b;
  const plano = LADO * LADO;
  const salida = new Float32Array(3 * plano);
  for (let y = 0; y < LADO; y++) {
    for (let x = 0; x < LADO; x++) {
      // Inversa de la semejanza: a qué píxel de la foto mira cada píxel del recorte.
      const u = x - tx;
      const v = y - ty;
      const sx = (a * u + b * v) / det;
      const sy = (-b * u + a * v) / det;
      const ix = Math.floor(sx);
      const iy = Math.floor(sy);
      if (ix < 0 || iy < 0 || ix >= ancho - 1 || iy >= alto - 1) continue;
      const fx = sx - ix;
      const fy = sy - iy;
      const i = (iy * ancho + ix) * 4;
      const d = y * LADO + x;
      for (let c = 0; c < 3; c++) {
        const esquina =
          foto[i + c] * (1 - fx) * (1 - fy) +
          foto[i + 4 + c] * fx * (1 - fy) +
          foto[i + ancho * 4 + c] * (1 - fx) * fy +
          foto[i + ancho * 4 + 4 + c] * fx * fy;
        salida[c * plano + d] = (esquina - 127.5) / 127.5;
      }
    }
  }
  return salida;
}
