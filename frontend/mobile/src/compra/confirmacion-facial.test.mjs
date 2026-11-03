// Pruebas del contrato de la verificación facial antes de pagar (ticket 004).
// Plain JS a propósito, como el resto de tests del paquete móvil: node --test con strip-types.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  abrirConfirmacionFacial,
  cerrarConfirmacionFacial,
  consumirConfirmacion,
  decidirCompra,
} from "./confirmacion-facial.ts";

test("con la cara verificada la compra continúa", () => {
  abrirConfirmacionFacial("compra-1");
  cerrarConfirmacionFacial("ok");

  const decision = decidirCompra(consumirConfirmacion("compra-1"));
  assert.deepEqual(decision, { continuar: true, mensaje: "" });
});

test("cancelar impide la compra y dice que no se ha cobrado", () => {
  abrirConfirmacionFacial("compra-2");
  cerrarConfirmacionFacial("cancelado");

  const decision = decidirCompra(consumirConfirmacion("compra-2"));
  assert.equal(decision.continuar, false);
  assert.match(decision.mensaje, /Has cancelado/);
  assert.match(decision.mensaje, /No se ha cobrado nada/);
});

test("un rechazo de la API impide la compra y conserva el motivo", () => {
  abrirConfirmacionFacial("compra-3");
  cerrarConfirmacionFacial("error", "La cara no coincide");

  const decision = decidirCompra(consumirConfirmacion("compra-3"));
  assert.equal(decision.continuar, false);
  assert.match(decision.mensaje, /La cara no coincide/);
  assert.match(decision.mensaje, /No se ha cobrado nada/);
});

test("un error sin motivo concreto sigue siendo recuperable y no compra", () => {
  abrirConfirmacionFacial("compra-4");
  cerrarConfirmacionFacial("error");

  const decision = decidirCompra(consumirConfirmacion("compra-4"));
  assert.equal(decision.continuar, false);
  assert.match(decision.mensaje, /puedes intentarlo otra vez/);
});

test("el resultado de otra compra no vale y cada uno se consume una vez", () => {
  abrirConfirmacionFacial("compra-5");
  cerrarConfirmacionFacial("ok");

  assert.equal(consumirConfirmacion("compra-6"), null);
  assert.equal(decidirCompra(null).continuar, false);

  assert.ok(consumirConfirmacion("compra-5"));
  assert.equal(consumirConfirmacion("compra-5"), null);
});

test("no se puede cerrar una confirmación que no se ha abierto", () => {
  cerrarConfirmacionFacial("ok");
  assert.equal(consumirConfirmacion("compra-7"), null);
});
