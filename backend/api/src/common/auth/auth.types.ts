export type Rol = 'viajero' | 'revisor' | 'admin';

export interface UsuarioAutenticado {
  id: string;
  email: string | null;
  rol: Rol;
}
