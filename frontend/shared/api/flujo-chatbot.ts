// Lector de los eventos SSE de `POST /chatbot/mensaje/flujo`. Va aparte del componente para poder
// probar los cortes raros del flujo (un evento puede llegar partido en dos trozos).
export interface EventoFlujo {
  evento: string;
  datos: unknown;
}

/**
 * Separa los eventos completos del texto recibido y devuelve el trozo que aún no ha terminado.
 * Los eventos ilegibles se descartan en vez de romper la conversación.
 */
export function parsearEventos(buffer: string): { eventos: EventoFlujo[]; resto: string } {
  const trozos = buffer.split(/\r?\n\r?\n/);
  const resto = trozos.pop() ?? "";
  const eventos: EventoFlujo[] = [];

  for (const trozo of trozos) {
    let evento = "message";
    const datos: string[] = [];
    for (const linea of trozo.split(/\r?\n/)) {
      if (linea.startsWith("event:")) evento = linea.slice("event:".length).trim();
      else if (linea.startsWith("data:")) datos.push(linea.slice("data:".length).trim());
    }
    if (datos.length === 0) continue;
    try {
      eventos.push({ evento, datos: JSON.parse(datos.join("\n")) });
    } catch {
      // Evento incompleto o corrupto: se ignora.
    }
  }

  return { eventos, resto };
}
