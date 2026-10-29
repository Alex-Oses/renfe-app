import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ClaudeTextBlock {
  type: 'text';
  text: string;
}

export interface ClaudeToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export type ClaudeContentBlock = ClaudeTextBlock | ClaudeToolUseBlock;

export interface ClaudeResponse {
  stop_reason: string;
  content: ClaudeContentBlock[];
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: unknown;
}

export interface ClaudeTool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

@Injectable()
export class ClaudeProvider {
  private readonly endpoint = 'https://api.anthropic.com/v1/messages';

  constructor(private readonly config: ConfigService) {}

  async completar(
    messages: ClaudeMessage[],
    tools: ClaudeTool[],
  ): Promise<ClaudeResponse> {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY')?.trim();
    if (!apiKey) {
      throw new ServiceUnavailableException('El chatbot no está configurado');
    }

    let response: Response;
    try {
      response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.config.get<string>('ANTHROPIC_MODEL') ?? 'claude-3-5-haiku-latest',
          max_tokens: 800,
          system:
            'Eres el asistente de Renfe. Responde en español, de forma concisa y precisa. ' +
            'Usa las herramientas para consultar datos actuales; nunca inventes estaciones, horarios o posiciones. ' +
            'Solo puedes hacer consultas de lectura y nunca puedes reservar, cancelar, validar billetes ni pedir secretos.',
          messages,
          tools,
        }),
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      throw new ServiceUnavailableException('El proveedor del chatbot no responde');
    }

    if (!response.ok) {
      throw new ServiceUnavailableException('El proveedor del chatbot ha rechazado la petición');
    }

    const cuerpo: unknown = await response.json();
    if (!esRespuestaClaude(cuerpo)) {
      throw new ServiceUnavailableException('El proveedor del chatbot devolvió una respuesta inválida');
    }
    return cuerpo;
  }
}

function esRespuestaClaude(valor: unknown): valor is ClaudeResponse {
  if (!valor || typeof valor !== 'object') return false;
  const respuesta = valor as { stop_reason?: unknown; content?: unknown };
  if (typeof respuesta.stop_reason !== 'string' || !Array.isArray(respuesta.content)) return false;
  return respuesta.content.every((bloque) => {
    if (!bloque || typeof bloque !== 'object') return false;
    const tipo = (bloque as { type?: unknown }).type;
    return tipo === 'text' || tipo === 'tool_use';
  });
}
