import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { EstacionesService } from '../estaciones/estaciones.service.js';
import { PosicionesService } from '../posiciones/posiciones.service.js';
import { TrenesService, type Tren } from '../trenes/trenes.service.js';
import {
  GeminiProvider,
  type GeminiContent,
  type GeminiFunctionCallPart,
  type GeminiPart,
  type GeminiTool,
} from './gemini.provider.js';
import { comprobarEntrada, comprobarRespuesta } from './guardrails.js';
import type { MensajeChatbotDto } from './dto/mensaje-chatbot.dto.js';

const MAX_ITERACIONES = 5;
// `/posiciones` trae ~200 KB (miles de trenes): al modelo solo le sirve un resumen.
const MAX_POSICIONES = 15;
// Memoria de la conversación: los 4 últimos intercambios (usuario + asistente).
const MAX_MENSAJES = 8;
const VIDA_CONVERSACION_MS = 30 * 60_000;
// Trenes que se devuelven al frontend para pintar la lista de resultados.
const MAX_TRENES = 8;

/** Progreso del turno, para que el frontend pueda enseñar qué está haciendo la IA. */
export type PasoChatbot =
  | { paso: 'analizando' }
  | { paso: 'consultando'; herramienta: string }
  | { paso: 'razonando' };

const TOOLS: GeminiTool[] = [
  {
      name: 'buscar_estaciones',
      description: 'Busca estaciones por nombre. Usa esta herramienta antes de buscar trenes si solo tienes nombres.',
      parameters: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'Nombre parcial de la estación' },
        feed: { type: 'string', enum: ['cercanias', 'avld'] },
        limit: { type: 'integer', minimum: 1, maximum: 10 },
      },
      required: ['q'],
      },
  },
  {
      name: 'buscar_trenes',
      description: 'Busca trenes directos entre dos estaciones para una fecha AAAA-MM-DD.',
      parameters: {
      type: 'object',
      properties: {
        origen: { type: 'string', description: 'ID de estación' },
        destino: { type: 'string', description: 'ID de estación' },
        fecha: { type: 'string', description: 'Fecha local AAAA-MM-DD' },
        limit: { type: 'integer', minimum: 1, maximum: 10 },
      },
      required: ['origen', 'destino', 'fecha'],
      },
  },
  {
      name: 'detalle_tren',
      description: 'Obtiene las paradas y horas de un viaje identificado por feed, tripId y fecha.',
      parameters: {
      type: 'object',
      properties: {
        feed: { type: 'string', enum: ['cercanias', 'avld'] },
        tripId: { type: 'string' },
        fecha: { type: 'string', description: 'Fecha local AAAA-MM-DD' },
      },
      required: ['feed', 'tripId', 'fecha'],
      },
  },
  {
      name: 'consultar_posiciones',
      description: 'Consulta las posiciones actuales publicadas por Renfe, opcionalmente filtradas por feed. Devuelve el total de trenes y una muestra.',
      parameters: {
      type: 'object',
      properties: {
        feed: { type: 'string', enum: ['cercanias', 'avld'] },
      },
      },
  },
  {
      name: 'posicion_tren',
      description: 'Posición actual de un viaje concreto que está circulando ahora. Saca el tripId de buscar_trenes o detalle_tren.',
      parameters: {
      type: 'object',
      properties: {
        feed: { type: 'string', enum: ['cercanias', 'avld'] },
        tripId: { type: 'string' },
      },
      required: ['feed', 'tripId'],
      },
  },
];

@Injectable()
export class ChatbotService {
  // shortcut: memoria en el proceso, por conversación y 30 min. Se pierde al reiniciar y no se
  // comparte entre instancias; si el chatbot se escala, mover a Redis o a una tabla.
  private readonly conversaciones = new Map<string, { mensajes: GeminiContent[]; expira: number }>();

  constructor(
    private readonly gemini: GeminiProvider,
    private readonly estaciones: EstacionesService,
    private readonly trenes: TrenesService,
    private readonly posiciones: PosicionesService,
  ) {}

  async responder(
    { mensaje, conversationId }: MensajeChatbotDto,
    alPaso?: (paso: PasoChatbot) => void,
  ) {
    comprobarEntrada(mensaje);
    const id = conversationId ?? randomUUID();
    const historial = this.historial(id);
    const pregunta: GeminiContent = { role: 'user', parts: [{ text: mensaje.trim() }] };
    const mensajes: GeminiContent[] = [...historial, pregunta];
    const herramientas = new Set<string>();
    // Lo último que ha encontrado `buscar_trenes`: el frontend lo pinta como resultados.
    const trenes = new Map<string, Tren>();

    alPaso?.({ paso: 'analizando' });

    for (let iteracion = 0; iteracion < MAX_ITERACIONES; iteracion += 1) {
      const respuesta = await this.gemini.completar(mensajes, TOOLS);
      const contenido = respuesta.candidates?.[0]?.content;
      if (!contenido) throw new ServiceUnavailableException('El chatbot no generó una respuesta');
      const usos = contenido.parts.filter(esLlamada);

      if (usos.length === 0) {
        const texto = contenido.parts
          .filter((parte): parte is { text: string } => 'text' in parte)
          .map((parte) => parte.text)
          .join('')
          .trim();
        if (!texto) throw new ServiceUnavailableException('El chatbot no generó una respuesta');
        const contestacion = comprobarRespuesta(texto, herramientas.size > 0);
        this.recordar(id, [...historial, pregunta, { role: 'model', parts: [{ text: contestacion }] }]);
        return {
          respuesta: contestacion,
          conversationId: id,
          herramientas: [...herramientas],
          trenes: [...trenes.values()].slice(0, MAX_TRENES),
        };
      }

      mensajes.push(contenido);
      mensajes.push({
        role: 'user',
        parts: await Promise.all(
          usos.map(async (uso) => {
            const nombre = uso.functionCall.name;
            herramientas.add(nombre);
            alPaso?.({ paso: 'consultando', herramienta: nombre });
            const resultado = await this.ejecutarHerramienta(nombre, uso.functionCall.args ?? {});
            if (nombre === 'buscar_trenes') {
              for (const tren of (resultado as { datos: Tren[] }).datos) trenes.set(tren.id, tren);
            }
            return { functionResponse: { name: nombre, response: { resultado } } };
          }),
        ),
      });
      alPaso?.({ paso: 'razonando' });
    }

    throw new ServiceUnavailableException('El chatbot ha superado el límite de consultas encadenadas');
  }

  /** Historial de solo texto: las llamadas a herramientas no se guardan (caducan con la respuesta). */
  private historial(id: string): GeminiContent[] {
    const conversacion = this.conversaciones.get(id);
    if (!conversacion || conversacion.expira < Date.now()) {
      this.conversaciones.delete(id);
      return [];
    }
    return conversacion.mensajes;
  }

  private recordar(id: string, mensajes: GeminiContent[]): void {
    if (this.conversaciones.size > 1000) {
      const ahora = Date.now();
      for (const [clave, valor] of this.conversaciones) {
        if (valor.expira < ahora) this.conversaciones.delete(clave);
      }
    }
    this.conversaciones.set(id, {
      mensajes: mensajes.slice(-MAX_MENSAJES),
      expira: Date.now() + VIDA_CONVERSACION_MS,
    });
  }

  private ejecutarHerramienta(nombre: string, input: Record<string, unknown>): Promise<unknown> {
    switch (nombre) {
      case 'buscar_estaciones':
        return this.estaciones.buscar({
          q: texto(input.q, 'q'),
          feed: feedOpcional(input.feed),
          limit: limite(input.limit),
        });
      case 'buscar_trenes':
        return this.trenes.buscar({
          origen: texto(input.origen, 'origen'),
          destino: texto(input.destino, 'destino'),
          fecha: fecha(input.fecha),
          limit: limite(input.limit),
        });
      case 'detalle_tren':
        return this.trenes.detalle(
          feed(input.feed),
          texto(input.tripId, 'tripId'),
          fecha(input.fecha),
        );
      case 'consultar_posiciones':
        return this.posiciones
          .obtener({ feed: feedOpcional(input.feed) })
          .then(({ datos, actualizado }) => ({
            actualizado,
            total: datos.length,
            datos: datos.slice(0, MAX_POSICIONES),
          }));
      case 'posicion_tren':
        return this.posiciones
          .posicionDe(feed(input.feed), texto(input.tripId, 'tripId'))
          // Que el tren no circule ahora es una respuesta, no un error del chatbot.
          .catch((error: unknown) => {
            if (error instanceof NotFoundException) return null;
            throw error;
          });
      default:
        throw new ServiceUnavailableException('El chatbot solicitó una herramienta no permitida');
    }
  }
}

function esLlamada(parte: GeminiPart): parte is GeminiFunctionCallPart {
  return 'functionCall' in parte && typeof parte.functionCall?.name === 'string';
}

function texto(valor: unknown, campo: string): string {
  if (typeof valor !== 'string' || valor.trim().length === 0 || valor.length > 200) {
    throw new ServiceUnavailableException(`Argumento inválido del chatbot: ${campo}`);
  }
  return valor.trim();
}

function fecha(valor: unknown): string {
  const resultado = texto(valor, 'fecha');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(resultado)) {
    throw new ServiceUnavailableException('Argumento inválido del chatbot: fecha');
  }
  return resultado;
}

function feed(valor: unknown): 'cercanias' | 'avld' {
  if (valor !== 'cercanias' && valor !== 'avld') {
    throw new ServiceUnavailableException('Argumento inválido del chatbot: feed');
  }
  return valor;
}

function feedOpcional(valor: unknown): 'cercanias' | 'avld' | undefined {
  return valor === undefined ? undefined : feed(valor);
}

function limite(valor: unknown): number {
  if (valor === undefined) return 10;
  if (typeof valor !== 'number' || !Number.isInteger(valor) || valor < 1 || valor > 10) {
    throw new ServiceUnavailableException('Argumento inválido del chatbot: limit');
  }
  return valor;
}
