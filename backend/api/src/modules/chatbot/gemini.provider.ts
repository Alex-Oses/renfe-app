import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface GeminiTextPart {
  text: string;
}

export interface GeminiFunctionCallPart {
  functionCall: {
    name: string;
    args?: Record<string, unknown>;
    id?: string;
    thoughtSignature?: string;
  };
  thoughtSignature?: string;
}

export interface GeminiFunctionResponsePart {
  functionResponse: {
    name: string;
    response: Record<string, unknown>;
  };
}

export type GeminiPart = GeminiTextPart | GeminiFunctionCallPart | GeminiFunctionResponsePart;

export interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

export interface GeminiResponse {
  candidates?: Array<{
    content?: GeminiContent;
    finishReason?: string;
  }>;
}

export interface GeminiTool {
  name: string;
  description: string;
  parameters: {
      type: 'object';
      properties: Record<string, unknown>;
      required?: string[];
  };
}

@Injectable()
export class GeminiProvider {
  private readonly context: string;
  private readonly guardrails: string;

  constructor(private readonly config: ConfigService) {
    const root = dirname(fileURLToPath(import.meta.url));
    this.context = cargarMarkdown(join(root, 'context', 'RENFE_CONTEXT.md'));
    this.guardrails = cargarMarkdown(join(root, 'guardrails', 'RENFE_GUARDRAILS.md'));
  }

  async completar(
    contents: GeminiContent[],
    tools: GeminiTool[],
  ): Promise<GeminiResponse> {
    const apiKey = this.config.get<string>('GEMINI_API_KEY')?.trim();
    if (!apiKey) {
      throw new ServiceUnavailableException('El chatbot no está configurado');
    }

    const model = this.config.get<string>('GEMINI_MODEL')?.trim() ?? 'gemini-3.5-flash-lite';
    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=` +
      encodeURIComponent(apiKey);
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: construirPrompt(this.context, this.guardrails) }],
          },
          contents,
          tools: [{ functionDeclarations: tools }],
          generationConfig: { maxOutputTokens: 800, temperature: 0.2 },
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
    if (!esRespuestaGemini(cuerpo)) {
      throw new ServiceUnavailableException('El proveedor del chatbot devolvió una respuesta inválida');
    }
    return cuerpo;
  }
}

function cargarMarkdown(ruta: string): string {
  try {
    return readFileSync(ruta, 'utf8').replace(/\r\n/g, '\n').trim();
  } catch (error) {
    throw new Error(`No se puede cargar el prompt del chatbot: ${ruta}`, { cause: error });
  }
}

function construirPrompt(contexto: string, guardrails: string): string {
  return [
    '# GUARDRAILS — PRIORIDAD MÁXIMA',
    guardrails,
    '# CONTEXTO RENFE — FUENTE DE CONOCIMIENTO',
    contexto,
    '# REGLA OPERATIVA',
    'Tu única función es consultar las herramientas internas disponibles y transformar sus resultados en una respuesta útil para el usuario. No tienes navegación web ni acceso a Internet: no busques, abras ni cites información externa.',
  ].join('\n\n');
}

function esRespuestaGemini(valor: unknown): valor is GeminiResponse {
  if (!valor || typeof valor !== 'object') return false;
  const respuesta = valor as GeminiResponse;
  return (
    Array.isArray(respuesta.candidates) &&
    respuesta.candidates.every(
      (candidato) =>
        candidato.content !== undefined &&
        Array.isArray(candidato.content.parts) &&
        candidato.content.parts.every(
          (parte) =>
            ('text' in parte && typeof parte.text === 'string') ||
            ('functionCall' in parte &&
              typeof parte.functionCall?.name === 'string'),
        ),
    )
  );
}
