export type Rol = 'viajero' | 'revisor';

export interface UsuarioAutenticado {
  id: string;
  email: string | null;
  rol: Rol;
}
