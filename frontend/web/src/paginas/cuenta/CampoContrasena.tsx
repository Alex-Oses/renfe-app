import { useState } from "react";

interface Props {
  id: string;
  etiqueta: string;
  valor: string;
  alCambiar: (v: string) => void;
  autoComplete: "current-password" | "new-password";
  error?: string;
  conFuerza?: boolean;
}

// 0..4: longitud, mayúsculas y minúsculas, números, símbolos.
export function fuerzaContrasena(c: string): number {
  if (!c) return 0;
  let n = c.length >= 8 ? 1 : 0;
  if (c.length >= 12) n++;
  if (/[a-z]/.test(c) && /[A-Z]/.test(c)) n++;
  if (/\d/.test(c) && /[^A-Za-z0-9]/.test(c)) n++;
  return Math.max(1, Math.min(4, n));
}
const NOMBRES = ["", "Débil", "Mejorable", "Buena", "Muy buena"];

export function CampoContrasena({ id, etiqueta, valor, alCambiar, autoComplete, error, conFuerza }: Props) {
  const [ver, setVer] = useState(false);
  const nivel = fuerzaContrasena(valor);
  const ayuda = conFuerza ? `${id}-fuerza` : undefined;
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      <div className="campo__clave">
        <input
          id={id}
          type={ver ? "text" : "password"}
          value={valor}
          onChange={(e) => alCambiar(e.target.value)}
          autoComplete={autoComplete}
          required
          minLength={autoComplete === "new-password" ? 8 : undefined}
          aria-invalid={!!error}
          aria-describedby={[error && `${id}-error`, ayuda].filter(Boolean).join(" ") || undefined}
        />
        <button
          type="button"
          className="campo__ver"
          onClick={() => setVer((v) => !v)}
          aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={ver}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
            {ver && <path d="M3 3l18 18" />}
          </svg>
        </button>
      </div>
      {conFuerza && (
        <>
          <div className="fuerza" data-nivel={nivel} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <span id={ayuda}>
            {valor ? `Seguridad: ${NOMBRES[nivel]}. ` : ""}Al menos 8 caracteres; mejor con números y símbolos.
          </span>
        </>
      )}
      {error && (
        <p id={`${id}-error`} className="campo__error">
          {error}
        </p>
      )}
    </div>
  );
}
