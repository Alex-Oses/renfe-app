// Validación del entorno al arrancar: si algo está mal, el proceso no levanta
// (mejor fallar en el arranque que a mitad de una reserva).
export interface EntornoValidado {
  API_PORT: number;
  CORS_ORIGINS: string[];
}

const ORIGENES_DE_DESARROLLO = [
  'http://localhost:5173', // frontend/web (Vite)
  'http://localhost:8081', // Expo web
  'http://localhost:19006', // Expo web (versiones antiguas)
];

export function validarEntorno(
  config: Record<string, unknown>,
): Record<string, unknown> & EntornoValidado {
  const puerto = Number(config.API_PORT ?? 3000);
  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
    throw new Error(`API_PORT no es un puerto válido: ${String(config.API_PORT)}`);
  }

  const crudo = config.CORS_ORIGINS;
  const declarados = (typeof crudo === 'string' ? crudo : '')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);

  if (config.NODE_ENV === 'production' && declarados.length === 0) {
    throw new Error('CORS_ORIGINS es obligatorio en producción');
  }

  const secreto = config.SUPABASE_JWT_SECRET;
  if (typeof secreto === 'string' && secreto.length > 0 && secreto.length < 32) {
    throw new Error('SUPABASE_JWT_SECRET parece demasiado corto (secreto JWT de Supabase)');
  }

  return {
    ...config,
    API_PORT: puerto,
    CORS_ORIGINS: declarados.length > 0 ? declarados : ORIGENES_DE_DESARROLLO,
  };
}
