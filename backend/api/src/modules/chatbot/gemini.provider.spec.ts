import { Logger, ServiceUnavailableException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GeminiProvider } from './gemini.provider.js';

function config(valores: Record<string, string | undefined>): ConfigService {
  return { get: (clave: string) => valores[clave] } as unknown as ConfigService;
}

const RESPUESTA_OK = {
  candidates: [{ content: { role: 'model', parts: [{ text: 'Hola, soy el asistente.' }] } }],
};

describe('GeminiProvider (configuración y fallback)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('carga los prompts del chatbot al construirse', () => {
    expect(() => new GeminiProvider(config({}))).not.toThrow();
  });

  it('sin GEMINI_API_KEY falla con 503 y no llama al proveedor', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const provider = new GeminiProvider(config({ GEMINI_API_KEY: '   ' }));

    await expect(provider.completar([], [])).rejects.toThrow('El chatbot no está configurado');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('con GEMINI_MODEL vacía usa el modelo por defecto', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => RESPUESTA_OK });
    vi.stubGlobal('fetch', fetchMock);
    const provider = new GeminiProvider(
      config({ GEMINI_API_KEY: 'clave-de-prueba', GEMINI_MODEL: '' }),
    );

    const respuesta = await provider.completar([], []);

    expect(respuesta.candidates?.[0]?.content?.parts[0]).toEqual({ text: 'Hola, soy el asistente.' });
    const [url, opciones] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain('/models/gemini-3.5-flash-lite:generateContent');
    expect(opciones).toMatchObject({ method: 'POST' });
  });

  it('un 404 del proveedor señala GEMINI_MODEL y lo registra sin la clave', async () => {
    const error = vi.spyOn(Logger.prototype, 'error');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => '{"error":{"message":"model not found"}}',
      }),
    );
    const provider = new GeminiProvider(
      config({ GEMINI_API_KEY: 'clave-de-prueba', GEMINI_MODEL: 'modelo-inventado' }),
    );

    await expect(provider.completar([], [])).rejects.toThrow('El modelo del chatbot no existe');
    expect(String(error.mock.calls[0]?.[0])).toContain('HTTP 404');
    expect(String(error.mock.calls[0]?.[0])).not.toContain('clave-de-prueba');
  });

  it('un 400/403 del proveedor señala clave o modelo', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 403, text: async () => 'API key not valid' }),
    );
    const provider = new GeminiProvider(config({ GEMINI_API_KEY: 'clave-mala' }));

    await expect(provider.completar([], [])).rejects.toThrow(/clave o el modelo/);
  });

  it('un 429 explica que se agotó la cuota', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 429, text: async () => 'quota exceeded' }),
    );
    const provider = new GeminiProvider(config({ GEMINI_API_KEY: 'clave-de-prueba' }));

    await expect(provider.completar([], [])).rejects.toThrow(/cuota/);
  });

  it('si no hay red responde 503 sin lanzar el error crudo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('getaddrinfo ENOTFOUND')));
    const provider = new GeminiProvider(config({ GEMINI_API_KEY: 'clave-de-prueba' }));

    await expect(provider.completar([], [])).rejects.toThrow('El proveedor del chatbot no responde');
  });

  it('una respuesta sin candidates es un 503 controlado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
    const provider = new GeminiProvider(config({ GEMINI_API_KEY: 'clave-de-prueba' }));

    await expect(provider.completar([], [])).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
