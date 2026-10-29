// Reglas del TÍTULO de los PR: mismas que los commits, pero más flexibles.
// - El tipo no distingue mayúsculas: "Feat(db): ..." se acepta.
// - El ámbito es libre y opcional (no tiene que estar en la lista de commitlint).
// - El título puede llegar a 120 caracteres y terminar en punto.
// Los commits siguen validándose con commitlint.config.mjs (hook commit-msg).
const TIPOS = ["feat", "fix", "docs", "chore", "refactor", "test", "ci", "perf", "style", "build", "revert"];

const tipoValido = ({ type }) => {
  const tipo = (type ?? "").toLowerCase();
  return [
    TIPOS.includes(tipo),
    `el tipo debe ser uno de: ${TIPOS.join(", ")} (sin importar mayúsculas)`,
  ];
};

export default {
  extends: ["@commitlint/config-conventional"],
  plugins: [{ rules: { "type-enum-flexible": tipoValido } }],
  rules: {
    "type-enum": [0],
    "type-enum-flexible": [2, "always"],
    "type-case": [0],
    "scope-enum": [0],
    "scope-case": [0],
    "scope-empty": [0],
    "subject-case": [0],
    "subject-full-stop": [0],
    "header-max-length": [2, "always", 120],
  },
};
