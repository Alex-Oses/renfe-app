import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { EstacionesService } from '../estaciones/estaciones.service.js';
import { PosicionesService } from '../posiciones/posiciones.service.js';
import { TrenesService } from '../trenes/trenes.service.js';
import {
  ClaudeProvider,
  type ClaudeContentBlock,
  type ClaudeMessage,
  type ClaudeTool,
  type ClaudeToolUseBlock,
} from './claude.provider.js';
import type { MensajeChatbotDto } from './dto/mensaje-chatbot.dto.js';

const MAX_ITERACIONES = 5;

const TOOLS: ClaudeTool[] = [
  {
    name: 'buscar_estaciones',
    description: 'Busca estaciones por nombre. Usa esta herramienta antes de buscar trenes si solo tienes nombres.',
    input_schema: {
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
    input_schema: {
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
    input_schema: {
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
    input_schema: {
      type: 'object',
      properties: {
        feed: { type: 'string', enum: ['cercanias', 'avld'] },
      },
    },
  },
];

@Injectable()
export class ChatbotService {
  constructor(
    private readonly claude: ClaudeProvider,
    private readonly estaciones: EstacionesService,
    private readonly trenes: TrenesService,
    private readonly posiciones: PosicionesService,
  ) {}

  async responder({ mensaje, conversationId }: MensajeChatbotDto) {
    const id = conversationId ?? randomUUID();
    const mensajes: ClaudeMessage[] = [{ role: 'user', content: mensaje.trim() }];
    const herramientas = new Set<string>();

    for (let iteracion = 0; iteracion < MAX_ITERACIONES; iteracion += 1) {
      const respuesta = await this.claude.completar(mensajes, TOOLS);
      const usos = respuesta.content.filter(
        (bloque): bloque is ClaudeToolUseBlock => bloque.type === 'tool_use',
      );

      if (usos.length === 0) {
        const texto = respuesta.content
          .filter((bloque): bloque is Extract<ClaudeContentBlock, { type: 'text' }> => bloque.type === 'text')
          .map((bloque) => bloque.text)
          .join('')
          .trim();
        if (!texto) throw new ServiceUnavailableException('El chatbot no generó una respuesta');
        return { respuesta: texto, conversationId: id, herramientas: [...herramientas] };
      }

      mensajes.push({ role: 'assistant', content: respuesta.content });
      mensajes.push({
        role: 'user',
        content: await Promise.all(
          usos.map(async (uso) => {
            herramientas.add(uso.name);
            return {
              type: 'tool_result',
              tool_use_id: uso.id,
              content: JSON.stringify(await this.ejecutarHerramienta(uso)),
            };
          }),
        ),
      });
    }

    throw new ServiceUnavailableException('El chatbot ha superado el límite de consultas encadenadas');
  }

  private ejecutarHerramienta(uso: ClaudeToolUseBlock): Promise<unknown> {
    switch (uso.name) {
      case 'buscar_estaciones':
        return this.estaciones.buscar({
          q: texto(uso.input.q, 'q'),
          feed: feedOpcional(uso.input.feed),
          limit: limite(uso.input.limit),
        });
      case 'buscar_trenes':
        return this.trenes.buscar({
          origen: texto(uso.input.origen, 'origen'),
          destino: texto(uso.input.destino, 'destino'),
          fecha: fecha(uso.input.fecha),
          limit: limite(uso.input.limit),
        });
      case 'detalle_tren':
        return this.trenes.detalle(
          feed(uso.input.feed),
          texto(uso.input.tripId, 'tripId'),
          fecha(uso.input.fecha),
        );
      case 'consultar_posiciones':
        return this.posiciones.obtener({ feed: feedOpcional(uso.input.feed) });
      default:
        throw new ServiceUnavailableException('El chatbot solicitó una herramienta no permitida');
    }
  }
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
