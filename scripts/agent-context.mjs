#!/usr/bin/env node
// Imprime un resumen del vault de Obsidian para que los agentes de IA
// (Claude Code vía hook SessionStart, OpenCode vía /estado) arranquen con contexto.
// Uso: node scripts/agent-context.mjs [numHandoffs]

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const vault = join(root, "obsidian");
const numHandoffs = Number(process.argv[2] ?? 3);

function leer(rel) {
  const ruta = join(vault, rel);
  return existsSync(ruta) ? readFileSync(ruta, "utf8").trim() : `(no existe ${rel})`;
}

const salida = [];
salida.push("=== CONTEXTO DEL VAULT (obsidian/) ===");
salida.push("Sigue el protocolo de AGENTS.md: lee esto al empezar y deja un handoff al terminar (/handoff).");
salida.push("\n--- 01-estado/estado-equipo.md ---\n" + leer("01-estado/estado-equipo.md"));
salida.push("\n--- 01-estado/sprint-actual.md ---\n" + leer("01-estado/sprint-actual.md"));

const dirHandoffs = join(vault, "04-handoffs");
if (existsSync(dirHandoffs)) {
  const handoffs = readdirSync(dirHandoffs)
    .filter((f) => /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(f))
    .sort()
    .reverse()
    .slice(0, numHandoffs);
  salida.push(`\n--- Últimos ${handoffs.length} handoffs ---`);
  for (const f of handoffs) {
    salida.push(`\n### ${f}\n` + readFileSync(join(dirHandoffs, f), "utf8").trim());
  }
}

salida.push("\n=== FIN DEL CONTEXTO ===");
console.log(salida.join("\n"));
