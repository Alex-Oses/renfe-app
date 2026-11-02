// Comprobación de la matemática del facial sin cámara ni ONNX: `pnpm --filter @renfe/mobile test`.
// Es lo que cubre el pipeline antes de poder probarlo en un móvil (no hay build en este PC).
// Plain JS a propósito: así node --test lo ejecuta con --experimental-strip-types solo en matematica.ts.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  agrupar,
  decodificar,
  LADO,
  LADO_DET,
  normalizar,
  preparar,
  recortar,
  REFERENCIA,
  semejanza,
} from "./matematica.ts";

const cerca = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);

test("la semejanza recupera la transformación que lleva origen a destino", () => {
  const t = { a: 2.5, b: -0.7, tx: 40, ty: -12 };
  const origen = [
    [10, 20],
    [80, 15],
    [45, 60],
    [20, 90],
    [70, 85],
  ];
  const destino = origen.map(([x, y]) => [t.a * x - t.b * y + t.tx, t.b * x + t.a * y + t.ty]);
  const [a, b, tx, ty] = semejanza(origen, destino);
  cerca(a, t.a);
  cerca(b, t.b);
  cerca(tx, t.tx);
  cerca(ty, t.ty);
});

test("preparar escala la foto al cuadrado de 640, normaliza y rellena de negro", () => {
  const ancho = 4;
  const alto = 2; // apaisada: la altura del lienzo es 640 · 2/4 = 320
  const foto = new Uint8Array(ancho * alto * 4).fill(127);
  const { escala, lienzo } = preparar(foto, ancho, alto);

  cerca(escala, 160);
  assert.equal(lienzo.length, 3 * LADO_DET * LADO_DET);
  cerca(lienzo[0], (127 - 127.5) / 128); // píxel (0,0) en el canal R
  cerca(lienzo[LADO_DET * LADO_DET], (127 - 127.5) / 128); // canal G
  assert.equal(lienzo[320 * LADO_DET], 0); // por debajo de la foto: negro
});

test("agrupar identifica las rejillas de SCRFD por sus dimensiones", () => {
  const salidas = [
    { dims: [12800, 1], data: new Float32Array(12800) },
    { dims: [12800, 4], data: new Float32Array(51200) },
    { dims: [12800, 10], data: new Float32Array(128000) },
  ];
  const mapa = agrupar(salidas);
  assert.equal(mapa.get("12800x1"), salidas[0].data);
  assert.equal(mapa.get("12800x4"), salidas[1].data);
  assert.equal(mapa.get("12800x10"), salidas[2].data);
});

test("decodificar devuelve la caja y los 5 puntos de la cara con más puntuación", () => {
  // Rejilla de stride 8: 80×80 celdas con 2 anclas → 12800 posiciones.
  const lado = LADO_DET / 8;
  const puntajes = new Float32Array(lado * lado * 2);
  const cajas = new Float32Array(lado * lado * 2 * 4);
  const puntos = new Float32Array(lado * lado * 2 * 10);
  const rellenar = (x, y, score, caja, kps) => {
    const i = (y * lado + x) * 2; // ancla 0
    puntajes[i] = score;
    cajas.set(caja, i * 4);
    puntos.set(kps, i * 10);
  };
  // Cara en la celda (10, 20): centro (80, 160) en el lienzo de 640.
  rellenar(10, 20, 0.9, [1, 2, 3, 4], new Array(10).fill(0.5));
  // Otra cara que se solapa con la anterior, con menos puntuación: la descarta el NMS.
  rellenar(11, 20, 0.6, [1, 2, 3, 4], new Array(10).fill(0.5));

  const mapa = agrupar([
    { dims: [lado * lado * 2, 1], data: puntajes },
    { dims: [lado * lado * 2, 4], data: cajas },
    { dims: [lado * lado * 2, 10], data: puntos },
  ]);
  const det = decodificar(mapa, 1);
  assert.ok(det, "debería haber una cara");
  cerca(det.score, 0.9);
  cerca(det.caja.x1, 80 - 1 * 8);
  cerca(det.caja.y1, 160 - 2 * 8);
  cerca(det.caja.x2, 80 + 3 * 8);
  cerca(det.caja.y2, 160 + 4 * 8);
  assert.equal(det.puntos.length, 5);
  cerca(det.puntos[0][0], 80 + 0.5 * 8);
  cerca(det.puntos[0][1], 160 + 0.5 * 8);

  // Sin ninguna puntuación por encima del umbral no hay cara.
  assert.equal(decodificar(agrupar([{ dims: [1, 1], data: new Float32Array([0.1]) }]), 1), null);
});

test("recortar deja intacta una imagen que ya está alineada", () => {
  const lado = LADO;
  const foto = new Uint8Array(lado * lado * 4);
  for (let i = 0; i < lado * lado; i++) {
    foto[i * 4] = i % 256;
    foto[i * 4 + 1] = (i * 3) % 256;
    foto[i * 4 + 2] = (i * 7) % 256;
    foto[i * 4 + 3] = 255;
  }
  const salida = recortar(foto, lado, lado, REFERENCIA);
  assert.equal(salida.length, 3 * lado * lado);
  for (let y = 0; y < lado - 1; y++) {
    for (let x = 0; x < lado - 1; x++) {
      const d = y * lado + x;
      cerca(salida[d], (foto[d * 4] - 127.5) / 127.5, 1e-5);
      cerca(salida[lado * lado + d], (foto[d * 4 + 1] - 127.5) / 127.5, 1e-5);
    }
  }
});

test("la huella normalizada tiene norma 1", () => {
  const v = normalizar([3, 4]);
  cerca(Math.hypot(v[0], v[1]), 1);
  assert.equal(normalizar([0, 0])[0], 0);
});
