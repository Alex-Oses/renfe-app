// Adapta lo que escribe la web a lo que pide el contrato de /auth (endpoints.md).
// La UI llama al campo "contrasena" y la API espera "password"; el resto va tal cual.

// Lo que rellena la web (Acceder.tsx).
export interface Credenciales {
  email: string;
  contrasena: string;
}

export interface AltaCuenta extends Credenciales {
  nombre: string;
}

// Cuerpo de POST /auth/login y POST /auth/registro.
export interface CuerpoLoginApi {
  email: string;
  password: string;
}

export interface CuerpoRegistroApi extends CuerpoLoginApi {
  nombre: string;
}

export const cuerpoLogin = ({ email, contrasena }: Credenciales): CuerpoLoginApi => ({
  email: email.trim(),
  password: contrasena,
});

export const cuerpoRegistro = ({ nombre, email, contrasena }: AltaCuenta): CuerpoRegistroApi => ({
  nombre: nombre.trim(),
  email: email.trim(),
  password: contrasena,
});
