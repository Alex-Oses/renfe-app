import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hoyMadrid, sumarDias } from '../../common/gtfs/tiempo.js';

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

const MODELO_POR_DEFECTO = 'gemini-3.5-flash-lite';

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
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly context: string;
  private readonly endpoints: string;
  private readonly guardrails: string;
  private avisadoSinClave = false;

  constructor(private readonly config: ConfigService) {
    const root = dirname(fileURLToPath(import.meta.url));
    this.context = cargarMarkdown(join(root, 'context', 'RENFE_CONTEXT.md'));
    this.endpoints = cargarMarkdown(join(root, 'context', 'ENDPOINTS.md'));
    this.guardrails = cargarMarkdown(join(root, 'guardrails', 'RENFE_GUARDRAILS.md'));
  }

  async completar(
    contents: GeminiContent[],
    tools: GeminiTool[],
  ): Promise<GeminiResponse> {
    const apiKey = this.config.get<string>('GEMINI_API_KEY')?.trim();
    if (!apiKey) {
      if (!this.avisadoSinClave) {
        this.avisadoSinClave = true;
        this.logger.warn('GEMINI_API_KEY vacía: /chatbot responderá 503 hasta que se configure');
      }
      throw new ServiceUnavailableException('El chatbot no está configurado');
    }

    // `||` y no `??`: con GEMINI_MODEL= (vacía) la URL saldría sin modelo y el proveedor daría 404.
    const model = this.config.get<string>('GEMINI_MODEL')?.trim() || MODELO_POR_DEFECTO;
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
            parts: [{ text: construirPrompt(this.context, this.endpoints, this.guardrails, hoyMadrid()) }],
          },
          contents,
          tools: [{ functionDeclarations: tools }],
          generationConfig: { maxOutputTokens: 800, temperature: 0.2 },
        }),
        signal: AbortSignal.timeout(15_000),
      });
    } catch (error) {
      this.logger.error(
        `No se pudo contactar con Gemini (modelo ${model}): ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new ServiceUnavailableException('El proveedor del chatbot no responde');
    }

    if (!response.ok) {
      const detalle = await detalleDelError(response, apiKey);
      this.logger.error(`Gemini rechazó la petición (HTTP ${response.status}, modelo ${model}): ${detalle}`);
      throw new ServiceUnavailableException(mensajeDelEstado(response.status));
    }

    let cuerpo: unknown;
    try {
      cuerpo = await response.json();
    } catch (error) {
      this.logger.error(
        `Gemini devolvió un cuerpo que no es JSON (modelo ${model}): ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new ServiceUnavailableException('El proveedor del chatbot devolvió una respuesta inválida');
    }
    if (!esRespuestaGemini(cuerpo)) {
      this.logger.error(`Gemini devolvió una respuesta inesperada (modelo ${model})`);
      throw new ServiceUnavailableException('El proveedor del chatbot devolvió una respuesta inválida');
    }
    return cuerpo;
  }
}

async function detalleDelError(response: Response, apiKey: string): Promise<string> {
  try {
    const texto = (await response.text()).replace(/\s+/g, ' ').trim().slice(0, 300);
    return texto.replaceAll(apiKey, '***') || '<sin cuerpo>';
  } catch {
    return '<cuerpo ilegible>';
  }
}

function mensajeDelEstado(status: number): string {
  if (status === 400 || status === 403) {
    return 'El proveedor del chatbot ha rechazado la clave o el modelo (revisa GEMINI_API_KEY y GEMINI_MODEL)';
  }
  if (status === 404) {
    return 'El modelo del chatbot no existe (revisa GEMINI_MODEL)';
  }
  if (status === 429) {
    return 'El chatbot ha agotado la cuota del proveedor; inténtalo más tarde';
  }
  return `El proveedor del chatbot ha rechazado la petición (HTTP ${status})`;
}

function cargarMarkdown(ruta: string): string {
  try {
    return readFileSync(ruta, 'utf8').replace(/\r\n/g, '\n').trim();
  } catch (error) {
    throw new Error(`No se puede cargar el prompt del chatbot: ${ruta}`, { cause: error });
  }
}

function construirPrompt(
  contexto: string,
  endpoints: string,
  guardrails: string,
  hoy: string,
): string {
  return [
    '# GUARDRAILS — PRIORIDAD MÁXIMA',
    guardrails,
    '# CONTEXTO RENFE — FUENTE DE CONOCIMIENTO',
    contexto,
    '# ENDPOINTS — QUÉ PUEDES CONSULTAR Y CÓMO',
    endpoints,
    '# FECHA',
    // Sin esto el modelo inventa el año (responde «31 de octubre de 2024»).
    `Hoy es ${hoy} y mañana ${sumarDias(hoy, 1)}, en hora de Madrid. Cuando el usuario diga «hoy», «mañana» o un día sin año, usa estas fechas como referencia y pide siempre la fecha en AAAA-MM-DD.`,
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
