#!/usr/bin/env node
// Pruebas de las reglas de ramas. Se lanzan con `pnpm test:ramas` (también en la CI).
// Si alguien cambia el patrón de scripts/ramas.mjs y rompe las ramas del equipo,
// esto se pone en rojo antes de llegar a develop.
import assert from "node:assert/strict";
import { test } from "node:test";
import { esValida } from "./ramas.mjs";

test("acepta las ramas del equipo con formato <tipo>/<area>-<tema>", () => {
  assert.equal(esValida("feat/mobile-busqueda-trenes"), true);
  assert.equal(esValida("ci/infra-revision-ci-dependabot"), true);
  assert.equal(esValida("fix/api-qr-caducado"), true);
  assert.equal(esValida("docs/vault-adr-004"), true);
  assert.equal(esValida("release/sprint-1"), true);
});

test("acepta main y develop (los hooks son los que impiden trabajar ahí)", () => {
  assert.equal(esValida("main"), true);
  assert.equal(esValida("develop"), true);
});

test("acepta las ramas que crea Dependabot", () => {
  assert.equal(esValida("dependabot/npm_and_yarn/develop/multi-b1658bdecd"), true);
  assert.equal(esValida("dependabot/github_actions/develop/actions/labeler-7"), true);
});

test("rechaza nombres que no siguen el formato", () => {
  assert.equal(esValida("mi-rama"), false);
  assert.equal(esValida("feat/busqueda-trenes"), false); // sin área
  assert.equal(esValida("feat/mobile-Busqueda"), false); // mayúsculas
  assert.equal(esValida("feat/infra-"), false); // tema vacío
  assert.equal(esValida("dependabot"), false); // sin carpeta detrás
  assert.equal(esValida("release/sprint-uno"), false);
});
