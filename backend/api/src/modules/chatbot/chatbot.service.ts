import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { EstacionesService } from '../estaciones/estaciones.service.js';
import { PosicionesService } from '../posiciones/posiciones.service.js';
import { TrenesService } from '../trenes/trenes.service.js';
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

const TOOLS: GeminiTool[] = [{
  functionDeclarations: [
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
      description: 'Consulta las posiciones actuales publicadas por Renfe, opcionalmente filtradas por feed.',
      parameters: {
      type: 'object',
      properties: {
        feed: { type: 'string', enum: ['cercanias', 'avld'] },
      },
      },
    },
  ],
}];

@Injectable()
export class ChatbotService {
  constructor(
    private readonly gemini: GeminiProvider,
    private readonly estaciones: EstacionesService,
    private readonly trenes: TrenesService,
    private readonly posiciones: PosicionesService,
  ) {}

  async responder({ mensaje, conversationId }: MensajeChatbotDto) {
    comprobarEntrada(mensaje);
    const id = conversationId ?? randomUUID();
    const mensajes: GeminiContent[] = [{ role: 'user', parts: [{ text: mensaje.trim() }] }];
    const herramientas = new Set<string>();

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
        return { respuesta: comprobarRespuesta(texto), conversationId: id, herramientas: [...herramientas] };
      }

      mensajes.push(contenido);
      mensajes.push({
        role: 'user',
        parts: await Promise.all(
          usos.map(async (uso) => {
            herramientas.add(uso.functionCall.name);
            return {
              functionResponse: {
                name: uso.functionCall.name,
                response: { resultado: await this.ejecutarHerramienta(uso.functionCall.name, uso.functionCall.args ?? {}) },
              },
            };
          }),
        ),
      });
    }

    throw new ServiceUnavailableException('El chatbot ha superado el límite de consultas encadenadas');
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
        return this.posiciones.obtener({ feed: feedOpcional(input.feed) });
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
