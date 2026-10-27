// Estrella para guardar o quitar una línea favorita (origen y destino son ids de estación).
import { useAvisos } from "../estado/avisos";

export function BotonFavorito({ origen, destino, className = "" }: { origen: string; destino: string; className?: string }) {
  const { esFavorita, alternarFavorito } = useAvisos();
  const activa = esFavorita(origen, destino);
  return (
    <button
      type="button"
      className={`boton-favorito ${className}`}
      aria-pressed={activa}
      aria-label="Guardar en mis líneas"
      title={activa ? "Quitar de mis líneas" : "Guardar en mis líneas"}
      onClick={() => alternarFavorito(origen, destino)}
      style={{ border: 0, background: "none", cursor: "pointer", color: activa ? "var(--frambuesa)" : "var(--gris)", minWidth: 44, minHeight: 44 }}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill={activa ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" />
      </svg>
    </button>
  );
}
