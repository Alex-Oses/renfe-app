#!/usr/bin/env node
// Valida la rama actual. Lo usan los hooks de husky y la CI.
//   --commit : impide commitear directamente en main/develop
//   --push   : impide pushear a main/develop y ramas con nombre incorrecto
//   <rama>   : valida un nombre concreto (CI)
import { execSync } from "node:child_process";
import { esValida, PROTEGIDAS, AYUDA } from "./ramas.mjs";

const args = process.argv.slice(2);
const modo = args.find((a) => a.startsWith("--"));
const rama = args.find((a) => !a.startsWith("--")) ??
  execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();

if (rama === "HEAD") process.exit(0); // rebase o detached HEAD

if ((modo === "--commit" || modo === "--push") && PROTEGIDAS.includes(rama)) {
  console.error(`✖ No se trabaja directamente en '${rama}'. Usa una rama y abre un PR.\n${AYUDA}`);
  process.exit(1);
}

if (!esValida(rama)) {
  console.error(`✖ Nombre de rama no válido: '${rama}'\n${AYUDA}`);
  process.exit(1);
}
