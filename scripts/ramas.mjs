// Reglas de ramas compartidas por los hooks, los scripts y la CI.
export const TIPOS = ["feat", "fix", "docs", "chore", "refactor", "test", "ci", "hotfix", "release"];
export const AREAS = ["mobile", "api", "db", "gtfs", "face", "infra", "vault", "docs"];
export const PROTEGIDAS = ["main", "develop"];

// feat/mobile-busqueda-trenes · fix/api-reservas-duplicadas · release/sprint-1 · hotfix/api-qr-caducado
export const PATRON = new RegExp(
  `^(?:(?:${TIPOS.filter((t) => t !== "release").join("|")})/(?:${AREAS.join("|")})-[a-z0-9]+(?:-[a-z0-9]+)*|release/sprint-\\d+)$`,
);

export function esValida(rama) {
  return PROTEGIDAS.includes(rama) || PATRON.test(rama);
}

export const AYUDA = `Formato de rama: <tipo>/<area>-<tema-en-kebab-case>
  tipos: ${TIPOS.filter((t) => t !== "release").join(", ")}
  areas: ${AREAS.join(", ")}
  ejemplo: feat/mobile-busqueda-trenes
  releases: release/sprint-<n>
Crea ramas con:  pnpm rama <tipo> <area> <tema>`;
