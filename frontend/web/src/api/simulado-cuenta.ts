// Cuenta y login facial simulados. Dueño: agente de cuenta.
// Simula lo que haría la API: contraseña con hash y sal, y solo el embedding facial, nunca imágenes.
import type { EmbeddingFacial, Rol, Sesion, Usuario } from "./tipos";

interface UsuarioGuardado {
  usuario: Usuario;
  sal: string;
  hash: string;
  cara?: EmbeddingFacial;
}

const CLAVE_USUARIOS = "anden.usuarios";
// La comparte estado/sesion.tsx: así el simulado sabe quién es el usuario de la sesión actual.
export const CLAVE_SESION = "anden.sesion";

// Umbral estricto: Human considera ~0.5 "misma persona"; pedimos más para evitar falsos positivos.
export const UMBRAL_CARA = 0.6;

export function similitudCoseno(a: number[], b: number[]): number {
  if (a.length === 0 || a.length !== b.length) return 0;
  let ab = 0;
  let aa = 0;
  let bb = 0;
  for (let i = 0; i < a.length; i++) {
    ab += a[i] * b[i];
    aa += a[i] * a[i];
    bb += b[i] * b[i];
  }
  return aa && bb ? ab / Math.sqrt(aa * bb) : 0;
}

function leer(): Record<string, UsuarioGuardado> {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_USUARIOS) ?? "{}") as Record<string, UsuarioGuardado>;
  } catch {
    return {};
  }
}

function guardar(u: Record<string, UsuarioGuardado>) {
  try {
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(u));
  } catch {
    throw new Error("El navegador no deja guardar datos. Prueba fuera del modo privado.");
  }
}

const hex = (b: ArrayBuffer | Uint8Array) =>
  [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");

export async function hashContrasena(contrasena: string, sal: string): Promise<string> {
  // shortcut: SHA-256 con sal basta para la simulación; la API real debe usar Argon2id o bcrypt.
  return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${sal}:${contrasena}`)));
}

const normalizar = (email: string) => email.trim().toLowerCase();

const crearSesion = (usuario: Usuario): Sesion => ({ token: `simulado-${crypto.randomUUID()}`, usuario });

function usuarioDeSesion(): UsuarioGuardado | undefined {
  try {
    const s = JSON.parse(sessionStorage.getItem(CLAVE_SESION) ?? "null") as Sesion | null;
    return s ? leer()[normalizar(s.usuario.email)] : undefined;
  } catch {
    return undefined;
  }
}

export async function registrarse(d: { nombre: string; email: string; contrasena: string }): Promise<Sesion> {
  const email = normalizar(d.email);
  const nombre = d.nombre.trim();
  if (!nombre) throw new Error("Escribe tu nombre.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("El email no parece válido.");
  if (d.contrasena.length < 8) throw new Error("La contraseña necesita al menos 8 caracteres.");
  const usuarios = leer();
  if (usuarios[email]) throw new Error("Ya hay una cuenta con ese email. Entra con tu contraseña.");
  const sal = hex(crypto.getRandomValues(new Uint8Array(16)));
  const usuario: Usuario = { id: crypto.randomUUID(), nombre, email, caraRegistrada: false };
  usuarios[email] = { usuario, sal, hash: await hashContrasena(d.contrasena, sal) };
  guardar(usuarios);
  return crearSesion(usuario);
}

// Cuentas de demostración con rol (sin API no hay quien dé roles). Se crean al entrar por primera vez.
export const CUENTAS_DEMO: Record<string, { nombre: string; contrasena: string; rol: Rol }> = {
  "revisor@renfe-app.demo": { nombre: "Revisor de demostración", contrasena: "revisor123", rol: "revisor" },
  "admin@renfe-app.demo": { nombre: "Administración (demo)", contrasena: "admin1234", rol: "admin" },
};

async function crearCuentaDemo(email: string) {
  const demo = CUENTAS_DEMO[email];
  const usuarios = leer();
  if (!demo || usuarios[email]) return;
  const sal = hex(crypto.getRandomValues(new Uint8Array(16)));
  const usuario: Usuario = { id: `demo-${demo.rol}`, nombre: demo.nombre, email, caraRegistrada: false, rol: demo.rol };
  usuarios[email] = { usuario, sal, hash: await hashContrasena(demo.contrasena, sal) };
  guardar(usuarios);
}

export async function iniciarSesion(d: { email: string; contrasena: string }): Promise<Sesion> {
  await crearCuentaDemo(normalizar(d.email));
  const u = leer()[normalizar(d.email)];
  if (!u) throw new Error("No hay ninguna cuenta con ese email.");
  if ((await hashContrasena(d.contrasena, u.sal)) !== u.hash) throw new Error("La contraseña no es correcta.");
  return crearSesion(u.usuario);
}

export function registrarCara(embedding: EmbeddingFacial): { ok: true } {
  const actual = usuarioDeSesion();
  if (!actual) throw new Error("Entra en tu cuenta antes de activar el acceso con tu cara.");
  if (!embedding.length) throw new Error("No se ha podido leer tu cara. Inténtalo otra vez.");
  const usuarios = leer();
  const email = normalizar(actual.usuario.email);
  usuarios[email] = { ...actual, cara: embedding, usuario: { ...actual.usuario, caraRegistrada: true } };
  guardar(usuarios);
  return { ok: true };
}

export function verificarCara(d: { email: string; embedding: EmbeddingFacial }): Sesion {
  const u = leer()[normalizar(d.email)];
  if (!u) throw new Error("No hay ninguna cuenta con ese email.");
  if (!u.cara) throw new Error("Esta cuenta no tiene activado el acceso con la cara. Entra con tu contraseña.");
  if (similitudCoseno(u.cara, d.embedding) < UMBRAL_CARA)
    throw new Error("La cara no coincide con la de esta cuenta. Prueba con más luz o entra con tu contraseña.");
  return crearSesion(u.usuario);
}
