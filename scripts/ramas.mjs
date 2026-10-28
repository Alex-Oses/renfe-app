// Reglas de ramas compartidas por los hooks, los scripts y la CI.
export const TIPOS = ["feat", "fix", "docs", "chore", "refactor", "test", "ci", "hotfix", "release"];
export const AREAS = ["mobile", "api", "db", "gtfs", "face", "infra", "vault", "docs"];
export const PROTEGIDAS = ["main", "develop"];

// feat/mobile-busqueda-trenes · fix/api-reservas-duplicadas · release/sprint-1 · hotfix/api-qr-caducado
export const PATRON = new RegExp(
  `^(?:(?:${TIPOS.filter((t) => t !== "release").join("|")})/(?:${AREAS.join("|")})-[a-z0-9]+(?:-[a-z0-9]+)*|release/sprint-\\d+)$`,
);

// Las ramas de Dependabot no las crea una persona ni se pueden renombrar:
// dependabot/npm_and_yarn/develop/multi-b1658bdecd · dependabot/github_actions/develop/actions/labeler-7
// Sin esta excepción sus PRs nunca podrían pasar el check "PR / reglas".
export const PATRON_DEPENDABOT = /^dependabot\/[a-zA-Z0-9._/-]+$/;

export function esValida(rama) {
  return PROTEGIDAS.includes(rama) || PATRON.test(rama) || PATRON_DEPENDABOT.test(rama);
}

export const AYUDA = `Formato de rama: <tipo>/<area>-<tema-en-kebab-case>
  tipos: ${TIPOS.filter((t) => t !== "release").join(", ")}
  areas: ${AREAS.join(", ")}
  ejemplo: feat/mobile-busqueda-trenes
  releases: release/sprint-<n>
  (las ramas dependabot/* las crea Dependabot y se aceptan tal cual)
Crea ramas con:  pnpm rama <tipo> <area> <tema>`;
