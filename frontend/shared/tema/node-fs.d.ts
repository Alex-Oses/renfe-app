// shortcut: tipo mínimo de node:fs para tokens.test.ts sin añadir @types/node; si shared usa más Node, instalar @types/node.
declare module "node:fs" {
  export function readFileSync(ruta: URL | string, codificacion: "utf8"): string;
}
