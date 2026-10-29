import { ServiceUnavailableException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatbotService } from './chatbot.service.js';
import type { ClaudeProvider } from './claude.provider.js';

describe('ChatbotService', () => {
  const estaciones = { buscar: vi.fn() };
  const trenes = { buscar: vi.fn(), detalle: vi.fn() };
  const posiciones = { obtener: vi.fn() };
  const claude = { completar: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function servicio() {
    return new ChatbotService(
      claude as unknown as ClaudeProvider,
      estaciones as never,
      trenes as never,
      posiciones as never,
    );
  }

  it('devuelve una respuesta directa sin ejecutar herramientas', async () => {
    claude.completar.mockResolvedValueOnce({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Hola, soy el asistente de Renfe.' }],
    });

    await expect(
      servicio().responder({ mensaje: 'Hola' }),
    ).resolves.toMatchObject({
      respuesta: 'Hola, soy el asistente de Renfe.',
      herramientas: [],
    });
    expect(estaciones.buscar).not.toHaveBeenCalled();
  });

  it('ejecuta la herramienta de estaciones y continúa el turno', async () => {
    estaciones.buscar.mockResolvedValue({ datos: [{ id: '60000', nombre: 'Atocha' }], total: 1 });
    claude.completar
      .mockResolvedValueOnce({
        stop_reason: 'tool_use',
        content: [
          {
            type: 'tool_use',
            id: 'tool-1',
            name: 'buscar_estaciones',
            input: { q: 'Atocha' },
          },
        ],
      })
      .mockResolvedValueOnce({
        stop_reason: 'end_turn',
        content: [{ type: 'text', text: 'La estación es Madrid-Puerta de Atocha.' }],
      });

    await expect(servicio().responder({ mensaje: 'Busca Atocha' })).resolves.toMatchObject({
      respuesta: 'La estación es Madrid-Puerta de Atocha.',
      herramientas: ['buscar_estaciones'],
    });
    expect(estaciones.buscar).toHaveBeenCalledWith({ q: 'Atocha', feed: undefined, limit: 10 });
  });

  it('rechaza una herramienta desconocida', async () => {
    claude.completar.mockResolvedValueOnce({
      stop_reason: 'tool_use',
      content: [{ type: 'tool_use', id: 'tool-1', name: 'sql_libre', input: {} }],
    });

    await expect(servicio().responder({ mensaje: 'Haz cualquier cosa' })).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('corta un bucle de herramientas infinito', async () => {
    claude.completar.mockResolvedValue({
      stop_reason: 'tool_use',
      content: [
        {
          type: 'tool_use',
          id: 'tool-1',
          name: 'buscar_estaciones',
          input: { q: 'Atocha' },
        },
      ],
    });
    estaciones.buscar.mockResolvedValue({ datos: [], total: 0 });

    await expect(servicio().responder({ mensaje: 'Busca Atocha' })).rejects.toThrow(
      'límite de consultas',
    );
    expect(claude.completar).toHaveBeenCalledTimes(5);
  });
});
