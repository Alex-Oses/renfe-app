export type Rol = 'viajero' | 'revisor' | 'admin';

export interface UsuarioAutenticado {
  id: string;
  email: string | null;
  rol: Rol;
  /** Segundos Unix en que la API comprobó la cara (claim `cara_en`); null si se entró sin cara. */
  caraEn?: number | null;
}
