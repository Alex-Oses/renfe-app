import type { TipoAviso } from "@renfe/shared/api/tipos";

const TRAZOS: Record<TipoAviso, string> = {
  retraso: "M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
  llegada: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  cambio: "M4 8h13l-3-3M20 16H7l3 3",
  info: "M12 11v6M12 7.5v.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
};

export function IconoAviso({ tipo }: { tipo: TipoAviso }) {
  return (
    <svg className={`icono-aviso icono-aviso--${tipo}`} viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={TRAZOS[tipo]} />
    </svg>
  );
}

export function IconoCerrar() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
