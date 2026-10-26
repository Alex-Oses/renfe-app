#!/usr/bin/env node
// Trae lo último de develop a tu rama (rebase). Uso: pnpm sync
import { execSync } from "node:child_process";
const sh = (c) => execSync(c, { stdio: "inherit" });
sh("git fetch origin develop");
try {
  sh("git rebase origin/develop");
  console.log("\n✔ Rama al día con develop. Si ya la habías subido: git push --force-with-lease");
} catch {
  console.error("\n✖ Hay conflictos. Resuélvelos, 'git add' y 'git rebase --continue' (o 'git rebase --abort').");
  process.exit(1);
}
