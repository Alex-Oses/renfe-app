// Abonos y bonos simulados (contrato: GET/POST /abonos y GET /abonos/:id en endpoints.md).
import { ESTACIONES } from "./simulado";
import { CLAVE_SESION } from "./simulado-cuenta";
import { firmarQr, leerQrFirmado } from "./qr-billete";
import type { Abono, NuevoAbono, Sesion, TipoAbono } from "./tipos";

export const PREFIJO_QR_ABONO = "RNA1";

export interface InfoAbono {
  tipo: TipoAbono;
  nombre: string;
  descripcion: string;
  trayecto: boolean;
  dias: number;
  viajes: number | null;
  precio: number; // shortcut: precio fijo por tipo; la API real lo calculará por trayecto
}

export const TIPOS_ABONO: InfoAbono[] = [
  { tipo: "ave-ld-mensual", nombre: "Abono mensual AVE/Larga Distancia", descripcion: "Viajes ilimitados entre dos estaciones durante 30 días.", trayecto: true, dias: 30, viajes: null, precio: 290 },
  { tipo: "avant-mensual", nombre: "Abono mensual Avant", descripcion: "Viajes ilimitados en Avant entre dos estaciones durante 30 días.", trayecto: true, dias: 30, viajes: null, precio: 140 },
  { tipo: "cercanias-recurrente", nombre: "Abono recurrente Cercanías", descripcion: "Viajes ilimitados en Cercanías de tu núcleo durante 30 días.", trayecto: false, dias: 30, viajes: null, precio: 20 },
  { tipo: "bono-10", nombre: "Bono 10 viajes", descripcion: "Diez viajes entre dos estaciones en 60 días.", trayecto: true, dias: 60, viajes: 10, precio: 220 },
];

export const infoAbono = (t: TipoAbono) => {
  const i = TIPOS_ABONO.find((x) => x.tipo === t);
  if (!i) throw new Error("Ese tipo de abono no existe.");
  return i;
};

// Fechas "AAAA-MM-DD": hoy en hora local; las sumas en UTC para que no cambien con el horario de verano.
export const hoyIso = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const sumarDias = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export const finAbono = (tipo: TipoAbono, inicio: string) => sumarDias(inicio, infoAbono(tipo).dias - 1);

export type EstadoAbono = "pendiente" | "vigente" | "agotado" | "caducado";

export function estadoAbono(a: Pick<Abono, "inicio" | "fin" | "viajesRestantes">, hoy = hoyIso()): EstadoAbono {
  if (hoy > a.fin) return "caducado";
  if (a.viajesRestantes === 0) return "agotado";
  return hoy < a.inicio ? "pendiente" : "vigente";
}

// Resta un viaje a un bono (lo hará el revisor o el torno). Los abonos sin límite no cambian.
export function gastarViaje<T extends Pick<Abono, "inicio" | "fin" | "viajesRestantes">>(a: T, hoy = hoyIso()): T {
  if (estadoAbono(a, hoy) !== "vigente") throw new Error("El abono no está vigente.");
  return a.viajesRestantes === null ? a : { ...a, viajesRestantes: a.viajesRestantes - 1 };
}

export interface DatosQrAbono {
  v: 1;
  id: string;
  t: TipoAbono;
  o: string | null;
  d: string | null;
  ini: string;
  fin: string;
  vr: number | null;
  p: string;
}

export const crearQrAbono = (a: Abono, titular: string) =>
  firmarQr(PREFIJO_QR_ABONO, {
    v: 1,
    id: a.id,
    t: a.tipo,
    o: a.origen?.nombre ?? null,
    d: a.destino?.nombre ?? null,
    ini: a.inicio,
    fin: a.fin,
    vr: a.viajesRestantes,
    p: titular,
  } satisfies DatosQrAbono);

export const leerQrAbono = (texto: string) => leerQrFirmado<DatosQrAbono>(PREFIJO_QR_ABONO, texto);

// --- Almacén en localStorage (en memoria si falla) ---

const CLAVE = "anden-abonos";
let memoria: Abono[] = [];

function leer(): Abono[] {
  try {
    const t = localStorage.getItem(CLAVE);
    if (t) memoria = JSON.parse(t) as Abono[];
  } catch {
    /* sigue en memoria */
  }
  return memoria;
}

function guardar(l: Abono[]) {
  memoria = l;
  try {
    localStorage.setItem(CLAVE, JSON.stringify(l));
  } catch {
    /* sigue en memoria */
  }
}

// Solo para tests.
export const _vaciar = () => guardar([]);

function sesion(): Sesion | null {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_SESION) ?? "null") as Sesion | null;
  } catch {
    return null;
  }
}

const estacion = (id?: string) => {
  const e = ESTACIONES.find((x) => x.id === id);
  if (!e) throw new Error("Elige el origen y el destino del abono.");
  return { id: e.id, nombre: e.nombre };
};

export async function comprarAbono(n: NuevoAbono, hoy = hoyIso()): Promise<Abono> {
  const s = sesion();
  if (!s) throw new Error("Entra en tu cuenta para comprar un abono.");
  const info = infoAbono(n.tipo);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(n.inicio) || n.inicio < hoy) throw new Error("La fecha de inicio no puede ser anterior a hoy.");
  if (n.inicio > sumarDias(hoy, 60)) throw new Error("Solo puedes empezar el abono en los próximos 60 días.");
  const origen = info.trayecto ? estacion(n.origenId) : null;
  const destino = info.trayecto ? estacion(n.destinoId) : null;
  if (origen && origen.id === destino?.id) throw new Error("El origen y el destino tienen que ser distintos.");
  const sinQr: Abono = {
    id: `AB-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    usuarioId: s.usuario.id,
    tipo: n.tipo,
    nombre: info.nombre,
    origen,
    destino,
    inicio: n.inicio,
    fin: finAbono(n.tipo, n.inicio),
    viajesTotales: info.viajes,
    viajesRestantes: info.viajes,
    precio: info.precio,
    creado: new Date().toISOString(),
    qr: "",
  };
  const abono = { ...sinQr, qr: await crearQrAbono(sinQr, s.usuario.nombre) };
  guardar([abono, ...leer()]);
  return abono;
}

const mios = () => {
  const id = sesion()?.usuario.id;
  return id ? leer().filter((a) => a.usuarioId === id) : [];
};

// Si el abono se compró en este dispositivo, guarda el viaje que ha descontado el revisor.
export function apuntarViaje(id: string, viajesRestantes: number) {
  const l = leer();
  if (l.some((a) => a.id === id)) guardar(l.map((a) => (a.id === id ? { ...a, viajesRestantes } : a)));
}

export const misAbonos = (): Abono[] => mios();

export function obtenerAbono(id: string): Abono {
  const a = mios().find((x) => x.id === id);
  if (!a) throw new Error("No encontramos ese abono.");
  return a;
}
