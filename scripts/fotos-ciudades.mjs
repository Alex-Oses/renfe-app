// Genera frontend/shared/contenido/imagenes-extra.ts: hasta 4 fotos más por ciudad sacadas de Wikimedia
// Commons (licencias libres), para que la foto de cada ciudad varíe. Uso: node scripts/fotos-ciudades.mjs
// Parte de la foto que ya hay en imagenes.ts: sus categorías dicen dónde buscar más de la misma ciudad.
import { readFileSync, writeFileSync } from "node:fs";

const API = "https://commons.wikimedia.org/w/api.php";
const UA = { "User-Agent": "renfe-app-fotos/1.0 (proyecto de clase; https://github.com/Alex-Oses/renfe-app)" };
const MAX = 4;
const MALAS = /(map|mapa|plano|flag|bandera|escudo|coat[_ ]of[_ ]arms|logo|seal|diagram|chart|locator|svg|pdf|tif|interior|retrato|portrait|\bplate\b|siglo|century|painting|pintura|cuadro|grabado|engraving|litograf|postal|postcard|\b1[0-8]\d\d\b|\b19[0-5]\d\b|aeropuerto|airport|avi[oó]n|aircraft|airbus|boeing|cn-?235|casa[ _]c|military|militar|presenta|reuni[oó]n|alcalde|consejer|ministr|jornada|acto[ _]|inaugura|rueda[ _]de[ _]prensa|sign|cartel|oficina|office|food|comida|plato|vino)/i;
const AUTOR_MALO = /(attributed|anonymous|unknown|desconocido)/i;
const LIBRE = /^(cc0|cc[- ]by|public domain|pd)/i;

const fuente = readFileSync("frontend/shared/contenido/imagenes.ts", "utf8");
const bloque = fuente.slice(fuente.indexOf("export const fotos"), fuente.indexOf("export const fotosSeccion"));
const ciudades = [...bloque.matchAll(/^\s+"?([a-z0-9-]+)"?: \{ archivo: "([^"]+)"/gm)].map(([, slug, archivo]) => ({ slug, archivo }));

const pedir = async (params) => {
  const url = `${API}?${new URLSearchParams({ format: "json", formatversion: "2", origin: "*", ...params })}`;
  for (let intento = 0; intento < 3; intento++) {
    const r = await fetch(url, { headers: UA });
    if (r.ok) return r.json();
    await new Promise((ok) => setTimeout(ok, 2000 * (intento + 1)));
  }
  throw new Error(`Commons no responde: ${url}`);
};

const sinTildes = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const limpiar = (html = "") => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

const INFO = { prop: "imageinfo", iiprop: "size|extmetadata|mime", iiextmetadatafilter: "Artist|LicenseShortName" };

function buenas(paginas, ya) {
  const salida = [];
  for (const p of paginas ?? []) {
    const i = p.imageinfo?.[0];
    const archivo = p.title.replace(/^File:/, "");
    if (!i || ya.has(archivo) || MALAS.test(archivo) || i.mime !== "image/jpeg") continue;
    if (i.width < 1600 || i.width < i.height * 1.2) continue; // horizontales y grandes, como la portada
    const licencia = limpiar(i.extmetadata?.LicenseShortName?.value);
    if (!LIBRE.test(licencia)) continue;
    const autor = limpiar(i.extmetadata?.Artist?.value).slice(0, 60) || "Wikimedia Commons";
    if (AUTOR_MALO.test(autor)) continue; // cuadros y grabados antiguos, no fotos
    salida.push({ archivo, autor: `${autor}, ${licencia}` });
    ya.add(archivo);
  }
  return salida;
}

async function deCategoria(slug, archivo, ya) {
  const r = await pedir({ action: "query", titles: `File:${archivo}`, prop: "categories", cllimit: "50", clshow: "!hidden" });
  const cats = (r.query?.pages?.[0]?.categories ?? []).map((c) => c.title);
  const palabra = sinTildes(slug.split("-").find((w) => w.length > 3) ?? slug);
  // La categoría más corta que nombra la ciudad suele ser la de la ciudad, no la de un edificio.
  const cat = cats.filter((c) => sinTildes(c).includes(palabra)).sort((a, b) => a.length - b.length)[0];
  if (!cat) return [];
  const f = await pedir({ action: "query", generator: "categorymembers", gcmtitle: cat, gcmtype: "file", gcmlimit: "60", ...INFO });
  return buenas(f.query?.pages, ya);
}

async function deBusqueda(slug, ya) {
  const q = `${slug.replace(/-/g, " ")} España vista ciudad filetype:bitmap`;
  const f = await pedir({ action: "query", generator: "search", gsrsearch: q, gsrnamespace: "6", gsrlimit: "40", ...INFO });
  const palabra = sinTildes(slug.split("-").find((w) => w.length > 3) ?? slug);
  return buenas((f.query?.pages ?? []).filter((p) => sinTildes(p.title).includes(palabra)), ya);
}

// La URL que usa la web (Special:FilePath) tiene que responder: si no, la foto se descarta.
async function responde(archivo) {
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(archivo)}?width=800`;
  const r = await fetch(url, { method: "HEAD", headers: UA, redirect: "follow" }).catch(() => null);
  return r?.ok ?? false;
}

const extra = {};
for (const { slug, archivo } of ciudades) {
  const ya = new Set([archivo]);
  try {
    let lista = await deCategoria(slug, archivo, ya);
    if (lista.length < 2) lista = lista.concat(await deBusqueda(slug, ya));
    const validas = [];
    for (const f of lista) {
      if (validas.length >= MAX) break;
      if (await responde(f.archivo)) validas.push(f);
    }
    if (validas.length) extra[slug] = validas;
    console.log(`${slug}: ${validas.length}`);
  } catch (e) {
    console.log(`${slug}: error ${e.message}`);
  }
}

const cuerpo = Object.entries(extra)
  .map(([slug, lista]) => `  ${JSON.stringify(slug)}: [\n${lista.map((f) => `    ${JSON.stringify(f).replace(/"(archivo|autor)":/g, "$1: ")},`).join("\n")}\n  ],`)
  .join("\n");
writeFileSync(
  "frontend/shared/contenido/imagenes-extra.ts",
  `// Generado con scripts/fotos-ciudades.mjs: más fotos de Wikimedia Commons por ciudad (licencias libres),
// comprobadas con Special:FilePath. No editar a mano: vuelve a lanzar el script.
import type { Foto } from "./imagenes";

export const fotosExtra: Record<string, Foto[]> = {
${cuerpo}
};
`,
);
console.log(`Ciudades con fotos extra: ${Object.keys(extra).length} de ${ciudades.length}`);
