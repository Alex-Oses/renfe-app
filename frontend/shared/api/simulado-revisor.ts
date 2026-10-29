// Validación de billetes sin API. Con API: POST /billetes/validar (endpoints.md).
// El revisor suele estar en otro móvil que el viajero, así que aquí solo se puede comprobar
// la firma y las fechas. Que el billete exista y no esté anulado solo se sabe si se compró en
// este mismo dispositivo; si no, se dice que no se ha comprobado en el servidor.
import { leerQr, type DatosQr } from "./qr-billete";
import { billeteGuardado, reservaGuardada } from "./simulado-reservas";
import { apuntarViaje, estadoAbono, hoyIso, infoAbono, leerQrAbono, PREFIJO_QR_ABONO } from "./simulado-abonos";
import type { BilleteValidado, ResultadoValidacion } from "./tipos";

const CLAVE_VALIDACIONES = "anden.validaciones";
const CLAVE_VIAJES = "anden.viajes-abono"; // viajes que le quedan a cada bono según este revisor
const MARGEN_MS = 2 * 60 * 60_000; // tras la llegada, 2 h de margen antes de darlo por caducado

function validaciones(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_VALIDACIONES) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

function viajes(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_VIAJES) ?? "{}") as Record<string, number>;
  } catch {
    return {};
  }
}

function apuntar(id: string, cuando: string) {
  try {
    localStorage.setItem(CLAVE_VALIDACIONES, JSON.stringify({ ...validaciones(), [id]: cuando }));
  } catch {
    /* sin almacenamiento: no se recuerda */
  }
}

// "Lucía Pérez Gómez" -> "Lucía P. G.": el revisor ve lo justo para pedir el DNI.
export const enmascararNombre = (nombre: string) =>
  nombre
    .trim()
    .split(/\s+/)
    .map((p, i) => (i === 0 ? p : `${p[0]}.`))
    .join(" ");

// Abonos y bonos (QR "RNA1"). El QR lleva los viajes que quedaban al generarlo; si este
// revisor ya ha descontado alguno, manda su cuenta, que es menor.
async function validarAbono(qr: string, ahora: Date): Promise<ResultadoValidacion> {
  const validadoEn = ahora.toISOString();
  const lectura = await leerQrAbono(qr);
  if (!lectura.ok) return { estado: "falso", validadoEn, comprobadoEnServidor: false };
  const d = lectura.datos;
  let nombre: string;
  try {
    nombre = infoAbono(d.t).nombre;
  } catch {
    return { estado: "falso", validadoEn, comprobadoEnServidor: false };
  }
  const guardados = viajes()[d.id];
  const restantes = d.vr === null ? null : Math.min(d.vr, guardados ?? d.vr);
  const abono = { id: d.id, nombre, titular: enmascararNombre(d.p), origen: d.o, destino: d.d, inicio: d.ini, fin: d.fin, viajesRestantes: restantes };
  const base = { abono, validadoEn, comprobadoEnServidor: false };

  const estado = estadoAbono({ inicio: d.ini, fin: d.fin, viajesRestantes: restantes }, hoyIso(ahora));
  if (estado === "caducado") return { ...base, estado: "caducado" };
  if (estado === "agotado") return { ...base, estado: "agotado" };
  if (estado === "pendiente") return { ...base, estado: "otro_dia" };
  if (restantes === null) return { ...base, estado: "valido" };

  const quedan = restantes - 1;
  try {
    localStorage.setItem(CLAVE_VIAJES, JSON.stringify({ ...viajes(), [d.id]: quedan }));
  } catch {
    /* sin almacenamiento: no se recuerda */
  }
  apuntarViaje(d.id, quedan);
  return { ...base, abono: { ...abono, viajesRestantes: quedan }, estado: "valido" };
}

const aBillete = (d: DatosQr): BilleteValidado => ({
  id: d.id,
  localizador: d.loc,
  pasajero: d.p,
  documento: d.doc,
  tipo: d.tipo,
  numero: d.num,
  salida: d.sal,
  llegada: d.lle,
  origen: d.o,
  destino: d.d,
  coche: d.co,
  asiento: d.as,
  clase: d.cl,
});

const mismoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString();

export async function validarBillete(qr: string, ahora = new Date()): Promise<ResultadoValidacion> {
  if (qr.trim().startsWith(`${PREFIJO_QR_ABONO}.`)) return validarAbono(qr, ahora);
  const validadoEn = ahora.toISOString();
  const lectura = await leerQr(qr);
  if (!lectura.ok) return { estado: "falso", validadoEn, comprobadoEnServidor: false };

  const billete = aBillete(lectura.datos);
  const base = { billete, validadoEn, comprobadoEnServidor: false };
  const local = billeteGuardado(billete.id);
  if (local && reservaGuardada(local.reservaId)?.estado === "cancelada") return { ...base, estado: "anulado" };

  const salida = new Date(billete.salida);
  if (ahora.getTime() > new Date(billete.llegada).getTime() + MARGEN_MS) return { ...base, estado: "caducado" };
  if (!mismoDia(salida, ahora) && salida > ahora) return { ...base, estado: "otro_dia" };

  const anterior = validaciones()[billete.id];
  if (anterior) return { ...base, estado: "ya_validado", primeraValidacion: anterior };
  apuntar(billete.id, validadoEn);
  return { ...base, estado: "valido" };
}

// Solo para tests.
export function _olvidarValidaciones() {
  try {
    localStorage.removeItem(CLAVE_VALIDACIONES);
    localStorage.removeItem(CLAVE_VIAJES);
  } catch {
    /* nada */
  }
}
