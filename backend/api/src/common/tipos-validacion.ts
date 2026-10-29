/** Literales de `POST /billetes/validar` (contrato y `validaciones.resultado`). */
export type EstadoValidacion =
  | 'valido'
  | 'ya_validado'
  | 'otro_dia'
  | 'caducado'
  | 'anulado'
  | 'agotado'
  | 'falso'
  | 'no_existe';
