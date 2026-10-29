import { SignJWT } from 'jose';

// El token es **de la API**, no de Supabase: HS256 con `JWT_SECRET`.
// Supabase Cloud firma con claves asimétricas (ES256), así que su `access_token`
// no lo puede verificar el guard. Con un secreto propio, la contraseña y la cara
// entran por el mismo camino y el rol se sigue leyendo de `perfiles.rol`.
const HORAS_TOKEN = 12;

export function firmarToken(
  usuario: { id: string; email: string | null },
  secreto: string,
): Promise<string> {
  return new SignJWT({ email: usuario.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(usuario.id)
    .setIssuedAt()
    .setExpirationTime(`${HORAS_TOKEN}h`)
    .sign(new TextEncoder().encode(secreto));
}
