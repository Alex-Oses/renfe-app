// Una salida ya pasada no se puede seleccionar ni comprar. Se compara el instante ISO con offset
// del contrato: Date.parse respeta el offset, así que el cambio de día y los trenes nocturnos no
// dependen de la zona horaria del dispositivo.
export function haSalido(salida: string, ahora: number = Date.now()): boolean {
  const instante = Date.parse(salida);
  // Si la hora no es válida no se oculta el tren: el fallo estará en otro sitio.
  return Number.isFinite(instante) && instante <= ahora;
}
