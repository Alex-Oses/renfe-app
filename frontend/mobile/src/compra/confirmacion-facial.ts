// Verificación facial antes de confirmar la compra (ticket 004).
// La verificación es la de siempre (`/auth/cara/verificar`): no hay endpoint nuevo. El resultado se
// liga a un intento de compra concreto para que no valga la confirmación de otra compra ni una que
// llegue tarde. Solo se guarda aquí, en memoria: la foto nunca sale del teléfono (ADR-007).
export type ResultadoFacial = "ok" | "cancelado" | "error";

export interface ConfirmacionFacial {
  intento: string;
  resultado: ResultadoFacial;
  mensaje?: string;
}

export interface DecisionCompra {
  continuar: boolean;
  mensaje: string;
}

let pendiente: string | null = null;
let ultima: ConfirmacionFacial | null = null;

/** La pantalla de la cara apunta el intento que la abrió; invalida cualquier resultado anterior. */
export function abrirConfirmacionFacial(intento: string) {
  pendiente = intento;
  ultima = null;
}

/** Solo cuenta mientras haya una compra esperando: no se puede confirmar una compra que no existe. */
export function cerrarConfirmacionFacial(resultado: ResultadoFacial, mensaje?: string) {
  if (!pendiente) return;
  ultima = { intento: pendiente, resultado, ...(mensaje ? { mensaje } : {}) };
}

/** Devuelve el resultado una sola vez y lo borra: cada intento se resuelve como mucho una vez. */
export function consumirConfirmacion(intento: string): ConfirmacionFacial | null {
  if (ultima?.intento !== intento) return null;
  const resultado = ultima;
  ultima = null;
  pendiente = null;
  return resultado;
}

/** Qué hacer al volver a la pantalla de pago. Sin resultado no se compra y no se avisa de nada. */
export function decidirCompra(resultado: ConfirmacionFacial | null): DecisionCompra {
  if (!resultado) return { continuar: false, mensaje: "" };
  if (resultado.resultado === "ok") return { continuar: true, mensaje: "" };
  if (resultado.resultado === "cancelado") {
    return {
      continuar: false,
      mensaje: "Has cancelado la verificación facial. No se ha cobrado nada: puedes intentarlo otra vez.",
    };
  }
  return {
    continuar: false,
    mensaje: resultado.mensaje
      ? `No se ha podido comprobar tu cara: ${resultado.mensaje}. No se ha cobrado nada.`
      : "No se ha podido comprobar tu cara. No se ha cobrado nada: puedes intentarlo otra vez.",
  };
}
