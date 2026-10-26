#!/usr/bin/env node
// Crea una rama de trabajo desde develop actualizado.
// Uso: pnpm rama <tipo> <area> <tema...>   ej: pnpm rama feat mobile busqueda trenes
import { execSync } from "node:child_process";
import { esValida, AYUDA } from "./ramas.mjs";

const [tipo, area, ...tema] = process.argv.slice(2);
if (!tipo || !area || tema.length === 0) {
  console.error(AYUDA);
  process.exit(1);
}

const slug = tema.join("-").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const rama = `${tipo}/${area}-${slug}`;
if (!esValida(rama)) {
  console.error(`✖ '${rama}' no cumple el formato.\n${AYUDA}`);
  process.exit(1);
}

const sh = (c) => execSync(c, { stdio: "inherit" });
if (execSync("git status --porcelain", { encoding: "utf8" }).trim()) {
  console.error("✖ Tienes cambios sin commitear. Haz commit o 'git stash' antes de crear otra rama.");
  process.exit(1);
}
sh("git fetch origin develop");
sh(`git switch -c ${rama} origin/develop`);
console.log(`\n✔ Rama '${rama}' creada desde origin/develop. Cuando termines: git push -u origin ${rama}`);
