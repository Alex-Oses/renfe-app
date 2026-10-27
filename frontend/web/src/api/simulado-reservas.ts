// Reservas, pagos y billetes simulados. Dueño: agente de reservas.
import { obtenerTren } from "./simulado";
import { CLAVE_SESION } from "./simulado-cuenta";
import { calcularTotal } from "./simulado-precios";
import type { EnlaceWallet, Asiento, Billete, ClaseAsiento, IntentoPago, NuevaReserva, Reserva } from "./tipos";

const COCHES = 6;
const FILAS = 10;
const LETRAS = ["A", "B", "C", "D"] as const;
const FACTOR: Record<ClaseAsiento, number> = { Estándar: 1, Confort: 1.4, Prémium: 1.9 };
const CLAVE = "anden-reservas";

interface Almacen {
  reservas: Reserva[];
  billetes: Billete[];
}

let memoria: Almacen = { reservas: [], billetes: [] };

// localStorage puede no existir o fallar (modo privado, tests): entonces se queda en memoria.
function leer(): Almacen {
  try {
    const t = localStorage.getItem(CLAVE);
    if (t) memoria = JSON.parse(t) as Almacen;
  } catch {
    /* sigue en memoria */
  }
  return memoria;
}

function guardar(a: Almacen) {
  memoria = a;
  try {
    localStorage.setItem(CLAVE, JSON.stringify(a));
  } catch {
    /* sigue en memoria */
  }
}

// Solo para tests.
export function _vaciar() {
  guardar({ reservas: [], billetes: [] });
}

function semilla(texto: string): number {
  let h = 2166136261;
  for (const c of texto) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

const claseDeCoche = (c: number): ClaseAsiento => (c <= 2 ? "Prémium" : c <= 4 ? "Confort" : "Estándar");
const redondear = (n: number) => Math.round(n * 100) / 100;

export function obtenerAsientos(trenId: string): Asiento[] {
  const tren = obtenerTren(trenId);
  const ocupados = new Set(
    leer()
      .reservas.filter((r) => r.tren.id === trenId && r.estado !== "cancelada")
      .flatMap((r) => r.asientos.map((a) => a.id)),
  );
  const asientos: Asiento[] = [];
  for (let coche = 1; coche <= COCHES; coche++) {
    const clase = claseDeCoche(coche);
    for (let fila = 1; fila <= FILAS; fila++) {
      for (const letra of LETRAS) {
        const id = `${coche}-${fila}${letra}`;
        asientos.push({
          id,
          coche,
          fila,
          letra,
          clase,
          libre: semilla(`${trenId}:${id}`) % 100 >= 35 && !ocupados.has(id),
          precio: redondear(tren.precioDesde * FACTOR[clase]),
        });
      }
    }
  }
  return asientos;
}

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin 0/O, 1/I
function nuevoLocalizador(usados: Set<string>): string {
  let l = "";
  do {
    const n = crypto.getRandomValues(new Uint32Array(6));
    l = Array.from(n, (x) => ALFABETO[x % ALFABETO.length]).join("");
  } while (usados.has(l));
  return l;
}

export function crearReserva(r: NuevaReserva): Reserva {
  if (r.asientos.length === 0) throw new Error("Elige al menos un asiento.");
  if (r.pasajeros.length !== r.asientos.length) throw new Error("Hace falta un viajero por asiento.");
  if (new Set(r.asientos).size !== r.asientos.length) throw new Error("Hay asientos repetidos.");
  const todos = obtenerAsientos(r.trenId);
  const elegidos = r.asientos.map((id) => {
    const a = todos.find((x) => x.id === id);
    if (!a) throw new Error(`El asiento ${id} no existe.`);
    if (!a.libre) throw new Error(`El asiento ${id} ya está ocupado.`);
    return a;
  });
  const almacen = leer();
  const reserva: Reserva = {
    id: crypto.randomUUID(),
    localizador: nuevoLocalizador(new Set(almacen.reservas.map((x) => x.localizador))),
    tren: obtenerTren(r.trenId),
    asientos: elegidos.map((a) => ({ ...a, libre: false })),
    // El documento se guarda enmascarado: en este navegador puede entrar más de una persona.
    pasajeros: r.pasajeros.map((p) => ({ ...p, documento: enmascarar(p.documento) })),
    total: calcularTotal({ precios: elegidos.map((a) => a.precio), tipos: r.pasajeros.map((p) => p.tipo), tarifa: r.tarifa, descuento: r.descuento, extras: r.extras }).total,
    tarifa: r.tarifa,
    descuento: r.descuento,
    extras: r.extras,
    bebes: r.bebes,
    estado: "pendiente_pago",
    creada: new Date().toISOString(),
  };
  guardar({ ...almacen, reservas: [...almacen.reservas, reserva] });
  return reserva;
}

function buscarReserva(id: string): Reserva {
  const r = leer().reservas.find((x) => x.id === id);
  if (!r) throw new Error("Esa reserva no existe.");
  return r;
}

export function crearIntentoPago(reservaId: string): IntentoPago {
  const r = buscarReserva(reservaId);
  return { clientSecret: `simulado_${r.id}`, importe: r.total };
}

export function confirmarPago(reservaId: string): Reserva {
  const r = buscarReserva(reservaId);
  if (r.estado === "pagada") return r;
  if (r.estado === "cancelada") throw new Error("La reserva está cancelada.");
  const pagada: Reserva = { ...r, estado: "pagada" };
  const nuevos: Billete[] = r.asientos.map((asiento, i) => ({
    id: `${r.localizador}-${i + 1}`,
    reservaId: r.id,
    usuarioId: usuarioActual(),
    localizador: r.localizador,
    tren: r.tren,
    asiento,
    pasajero: r.pasajeros[i],
    qr: JSON.stringify({
      loc: r.localizador,
      tren: r.tren.numero,
      asiento: asiento.id,
      pasajero: `${r.pasajeros[i].nombre} ${r.pasajeros[i].apellidos}`,
      firma: "simulada",
    }),
  }));
  const a = leer();
  guardar({ reservas: a.reservas.map((x) => (x.id === r.id ? pagada : x)), billetes: [...a.billetes, ...nuevos] });
  return pagada;
}

function usuarioActual(): string | undefined {
  try {
    return (JSON.parse(sessionStorage.getItem(CLAVE_SESION) ?? "null") as { usuario?: { id: string } } | null)?.usuario?.id;
  } catch {
    return undefined;
  }
}

export const enmascarar = (doc: string) => (doc.length > 4 ? `${"•".repeat(doc.length - 4)}${doc.slice(-4)}` : doc);

// Cada cuenta ve solo sus billetes; sin sesión, solo los comprados sin sesión.
const esMio = (b: Billete) => b.usuarioId === usuarioActual();

export const misBilletes = (): Billete[] => leer().billetes.filter(esMio);

export function obtenerBillete(id: string): Billete {
  const b = leer().billetes.find((x) => x.id === id && esMio(x));
  if (!b) throw new Error("No encontramos ese billete.");
  return b;
}

// Sin API no hay quien firme el pase de Apple ni el JWT de Google: se avisa con un error claro.
export function enlaceWallet(_billeteId: string, _plataforma: EnlaceWallet["plataforma"]): EnlaceWallet {
  throw new Error("Añadir a la cartera estará disponible cuando la API firme los pases.");
}
