// Sustitutos de las APIs de navegador que usa @renfe/shared (simulados y QR firmado).
// Se importa lo primero en src/app/_layout.tsx. En web no hace nada: el navegador ya las trae.
import "expo-sqlite/localStorage/install"; // localStorage síncrono guardado en SQLite
import * as ExpoCrypto from "expo-crypto";
import { hmac } from "@noble/hashes/hmac.js";
import { sha256 } from "@noble/hashes/sha2.js";

type Datos = ArrayBuffer | ArrayBufferView;
const bytes = (d: Datos) =>
  d instanceof ArrayBuffer ? new Uint8Array(d) : new Uint8Array(d.buffer, d.byteOffset, d.byteLength);
const buffer = (u: Uint8Array) => u.slice().buffer;

// Solo lo que usa shared: SHA-256 y HMAC-SHA-256 con clave "raw". Clave = sus bytes.
type Clave = { bytes: Uint8Array };
const subtle = {
  digest: async (_alg: unknown, d: Datos) => buffer(sha256(bytes(d))),
  importKey: async (_f: "raw", clave: Datos): Promise<Clave> => ({ bytes: bytes(clave).slice() }),
  sign: async (_alg: unknown, k: Clave, d: Datos) => buffer(hmac(sha256, k.bytes, bytes(d))),
  verify: async (_alg: unknown, k: Clave, firma: Datos, d: Datos) => {
    const a = hmac(sha256, k.bytes, bytes(d));
    const b = bytes(firma);
    return a.length === b.length && a.every((x, i) => x === b[i]);
  },
};

const g = globalThis as unknown as { crypto?: Record<string, unknown> };
g.crypto ??= {};
g.crypto.getRandomValues ??= ExpoCrypto.getRandomValues;
g.crypto.randomUUID ??= ExpoCrypto.randomUUID;
g.crypto.subtle ??= subtle;
