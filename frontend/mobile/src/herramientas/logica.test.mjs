// Mismos cálculos que la web (componentes/herramientas/logica.ts): `pnpm --filter @renfe/mobile test`.
// Plain JS a propósito, como matematica.test.mjs: node --test lo ejecuta con --experimental-strip-types.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  costeCambio,
  devolucionAnulacion,
  emailValido,
  franjasLibres,
  horariosCercanias,
  lineasNucleo,
  LOCALIZADOR,
  movilValido,
  nifValido,
  puntosGanados,
  tarifaDe,
  telefonoValido,
} from "./logica.ts";

test("cambios y anulaciones por tarifa", () => {
  assert.equal(costeCambio("Básico", 50), 10);
  assert.equal(costeCambio("Elige", 50), 0);
  assert.equal(costeCambio("Prémium", 50), 0);
  assert.equal(devolucionAnulacion("Básico", 50), 0);
  assert.equal(devolucionAnulacion("Elige", 50), 35);
  assert.equal(devolucionAnulacion("Prémium", 50), 50);
});

test("la tarifa se deduce de la clase del asiento", () => {
  const reserva = (clase) => ({ asientos: [{ clase }] });
  assert.equal(tarifaDe(reserva("Estándar")), "Básico");
  assert.equal(tarifaDe(reserva("Confort")), "Elige");
  assert.equal(tarifaDe(reserva("Prémium")), "Prémium");
  assert.equal(tarifaDe({ asientos: [] }), "Básico");
});

test("puntos por nivel", () => {
  assert.deepEqual(puntosGanados(100, "General"), { puntos: 1000, euros: 10 });
  assert.deepEqual(puntosGanados(100, "Oro"), { puntos: 1500, euros: 15 });
  assert.equal(puntosGanados(-5, "Plata").puntos, 0);
});

test("horarios de cercanías deterministas", () => {
  assert.deepEqual(horariosCercanias("madrid", "C1", 0, 3), horariosCercanias("madrid", "C1", 0, 3));
  assert.ok(horariosCercanias("madrid", "C1", 0, 3).length > 20);
  const primera = horariosCercanias("madrid", "C1", 0, 3)[0];
  assert.match(primera.sale, /^\d{2}:\d{2}$/);
  assert.match(primera.llega, /^\d{2}:\d{2}$/);
});

test("las líneas de cada núcleo son estables y con estaciones únicas", () => {
  const a = lineasNucleo("madrid");
  assert.deepEqual(a, lineasNucleo("madrid"));
  for (const l of a) {
    assert.ok(l.estaciones.length >= 3);
    assert.equal(l.estaciones.length, new Set(l.estaciones).size);
  }
});

test("validaciones de los formularios", () => {
  assert.ok(LOCALIZADOR.test("ABC123"));
  assert.ok(LOCALIZADOR.test("R-ABC123"));
  assert.ok(!LOCALIZADOR.test("AB1"));
  assert.ok(emailValido("viajero@ejemplo.com"));
  assert.ok(!emailValido("viajero@ejemplo"));
  assert.ok(telefonoValido("612 345 678"));
  assert.ok(!telefonoValido("112345678"));
  assert.ok(movilValido("712345678"));
  assert.ok(!movilValido("812345678"));
  assert.ok(nifValido("12345678Z"));
  assert.ok(!nifValido("1234"));
});

test("las franjas de cita previa dependen de estación y fecha", () => {
  assert.deepEqual(franjasLibres("Madrid", "2030-01-10"), franjasLibres("Madrid", "2030-01-10"));
  assert.deepEqual(franjasLibres("", "2030-01-10"), []);
  assert.ok(franjasLibres("Madrid", "2030-01-10").length < 11);
});
