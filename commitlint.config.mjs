// Conventional Commits: tipo(ámbito): descripción
// Lo ejecuta el hook .husky/commit-msg en cada commit y la CI en el título del PR.
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [2, "always", ["feat", "fix", "docs", "chore", "refactor", "test", "ci", "perf", "style", "build", "revert"]],
    "scope-enum": [2, "always", ["mobile", "api", "db", "gtfs", "face", "infra", "ci", "vault", "docs", "deps", "release"]],
    "scope-empty": [1, "never"],
    "subject-case": [0],
    "header-max-length": [2, "always", 100],
  },
};
