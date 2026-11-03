// Regresión del aviso "VirtualizedLists should never be nested inside plain ScrollViews".
// El repo no tiene entorno de render de React Native, así que se comprueba el contrato entre la
// hoja y el selector: la hoja debe poder ceder el desplazamiento a la lista virtualizada.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const leer = (ruta) => readFileSync(new URL(ruta, import.meta.url), "utf8");

test("la hoja puede ceder el desplazamiento a su contenido", () => {
  const hoja = leer("./Hoja.tsx");
  assert.match(hoja, /scroll = true/);
  assert.match(hoja, /scroll \?/);
});

test("el selector de estaciones no anida su FlatList en el ScrollView de la hoja", () => {
  const selectores = leer("./Selectores.tsx");
  const desde = selectores.indexOf("export function SelectorEstacion");
  const hasta = selectores.indexOf("// ---------------- Fecha");
  assert.ok(desde >= 0 && hasta > desde, "no se encontró SelectorEstacion");
  const bloque = selectores.slice(desde, hasta);
  assert.match(bloque, /<Hoja[^>]*scroll=\{false\}/);
  assert.match(bloque, /<FlatList/);
});
