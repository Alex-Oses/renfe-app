// Contenido del QR de un billete: "RNF1.<datos>.<firma>", ambos en base64url.
// Con la API real firma el servidor (Ed25519) y el revisor valida con POST /billetes/validar.
// Sin API se firma aquí con HMAC-SHA256 y una clave de demostración: sirve para detectar QR
// manipulados o inventados en la demo, NO es seguridad real (la clave va en el código de la web).
import type { Billete } from "./tipos";

export const PREFIJO_QR = "RNF1";
const CLAVE_DEMO = "renfe-app-demo-firma-qr";

// Claves cortas para que el QR sea pequeño y se lea bien con cámaras malas.
export interface DatosQr {
  v: 1;
  id: string; // id del billete
  rid: string; // id de la reserva
  loc: string; // localizador
  tipo: string; // AVE, Avlo…
  num: string; // número de tren
  sal: string; // salida, ISO
  lle: string; // llegada, ISO
  o: string; // estación de origen
  d: string; // estación de destino
  co: number; // coche
  as: string; // asiento, p. ej. "12A"
  cl: string; // clase
  p: string; // nombre y apellidos del viajero
  doc: string; // documento enmascarado (solo los 4 últimos)
}

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const deB64url = (s: string): Uint8Array<ArrayBuffer> =>
  Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

let clave: Promise<CryptoKey> | null = null;
const claveHmac = () =>
  (clave ??= crypto.subtle.importKey("raw", new TextEncoder().encode(CLAVE_DEMO), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]));

export const enmascararDoc = (doc: string) => (doc.length > 4 ? `${"•".repeat(4)}${doc.slice(-4)}` : doc);

export function datosDeBillete(b: Billete): DatosQr {
  return {
    v: 1,
    id: b.id,
    rid: b.reservaId,
    loc: b.localizador,
    tipo: b.tren.tipo,
    num: b.tren.numero,
    sal: b.tren.salida,
    lle: b.tren.llegada,
    o: b.tren.origen.nombre,
    d: b.tren.destino.nombre,
    co: b.asiento.coche,
    as: `${b.asiento.fila}${b.asiento.letra}`,
    cl: b.asiento.clase,
    p: `${b.pasajero.nombre} ${b.pasajero.apellidos}`.trim(),
    doc: enmascararDoc(b.pasajero.documento),
  };
}

export async function crearQr(b: Billete): Promise<string> {
  const datos = b64url(new TextEncoder().encode(JSON.stringify(datosDeBillete(b))));
  const firma = new Uint8Array(await crypto.subtle.sign("HMAC", await claveHmac(), new TextEncoder().encode(`${PREFIJO_QR}.${datos}`)));
  return `${PREFIJO_QR}.${datos}.${b64url(firma)}`;
}

export type LecturaQr = { ok: true; datos: DatosQr } | { ok: false; motivo: "formato" | "firma" };

export async function leerQr(texto: string): Promise<LecturaQr> {
  const partes = texto.trim().split(".");
  if (partes.length !== 3 || partes[0] !== PREFIJO_QR) return { ok: false, motivo: "formato" };
  let firma: Uint8Array<ArrayBuffer>;
  let datos: DatosQr;
  try {
    firma = deB64url(partes[2]);
    datos = JSON.parse(new TextDecoder().decode(deB64url(partes[1]))) as DatosQr;
  } catch {
    return { ok: false, motivo: "formato" };
  }
  const buena = await crypto.subtle.verify("HMAC", await claveHmac(), firma, new TextEncoder().encode(`${partes[0]}.${partes[1]}`));
  if (!buena) return { ok: false, motivo: "firma" };
  if (datos?.v !== 1 || !datos.id) return { ok: false, motivo: "formato" };
  return { ok: true, datos };
}
