import { useRef, useState, type FormEvent } from "react";
import type { Asiento, Pasajero, TipoViajero } from "../../api/tipos";
import { useSesion } from "../../estado/sesion";

type Campo = Exclude<keyof Pasajero, "tipo">;
const CAMPOS: { id: Campo; etiqueta: string; tipo: string; auto: string }[] = [
  { id: "nombre", etiqueta: "Nombre", tipo: "text", auto: "given-name" },
  { id: "apellidos", etiqueta: "Apellidos", tipo: "text", auto: "family-name" },
  { id: "documento", etiqueta: "DNI, NIE o pasaporte", tipo: "text", auto: "off" },
  { id: "email", etiqueta: "Correo electrónico", tipo: "email", auto: "email" },
];

function validar(c: Campo, v: string): string {
  const t = v.trim();
  if (!t) return "Este campo es obligatorio.";
  if (c === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return "Escribe un correo válido, por ejemplo ana@correo.es.";
  if (c === "documento" && !/^[A-Za-z0-9]{6,12}$/.test(t)) return "Usa entre 6 y 12 letras o números, sin espacios ni guiones.";
  return "";
}

const vacio = (): Pasajero => ({ nombre: "", apellidos: "", documento: "", email: "" });

interface Props {
  asientos: Asiento[];
  iniciales: Pasajero[];
  tipos?: TipoViajero[];
  onSeguir: (p: Pasajero[]) => void;
}

export function PasoViajeros({ asientos, iniciales, tipos, onSeguir }: Props) {
  const { sesion } = useSesion();
  const [datos, setDatos] = useState<Pasajero[]>(() =>
    asientos.map((_, i) => {
      if (iniciales[i]) return iniciales[i];
      if (i === 0 && sesion) {
        const [nombre, ...resto] = sesion.usuario.nombre.split(" ");
        return { ...vacio(), nombre, apellidos: resto.join(" "), email: sesion.usuario.email };
      }
      return vacio();
    }),
  );
  const [errores, setErrores] = useState<Record<string, string>>({});
  const form = useRef<HTMLFormElement>(null);

  const cambiar = (i: number, c: Campo, v: string) => {
    setDatos((d) => d.map((p, j) => (j === i ? { ...p, [c]: v } : p)));
    if (errores[`${i}-${c}`]) setErrores((e) => ({ ...e, [`${i}-${c}`]: validar(c, v) }));
  };

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const nuevos: Record<string, string> = {};
    datos.forEach((p, i) => CAMPOS.forEach(({ id }) => (nuevos[`${i}-${id}`] = validar(id, p[id]))));
    setErrores(nuevos);
    const primero = Object.keys(nuevos).find((k) => nuevos[k]);
    if (primero) {
      form.current?.querySelector<HTMLInputElement>(`#v-${primero}`)?.focus();
      return;
    }
    onSeguir(datos.map((p) => ({ nombre: p.nombre.trim(), apellidos: p.apellidos.trim(), documento: p.documento.trim().toUpperCase(), email: p.email.trim() })));
  };

  return (
    <form ref={form} onSubmit={enviar} noValidate className="viajeros">
      {asientos.map((a, i) => (
        <fieldset key={a.id} className="viajero">
          <legend>
            Viajero {i + 1}
            {tipos?.[i] === "nino" ? " (niño)" : ""} <span>· coche {a.coche}, asiento {a.fila}{a.letra}</span>
          </legend>
          <div className="viajero__campos">
            {CAMPOS.map((c) => {
              const k = `${i}-${c.id}`;
              const err = errores[k];
              return (
                <div className={`campo${err ? " campo--error" : ""}`} key={c.id}>
                  <label htmlFor={`v-${k}`}>{c.etiqueta}</label>
                  <input
                    id={`v-${k}`}
                    type={c.tipo}
                    autoComplete={c.auto}
                    value={datos[i][c.id]}
                    aria-invalid={!!err || undefined}
                    aria-describedby={err ? `e-${k}` : undefined}
                    onChange={(e) => cambiar(i, c.id, e.target.value)}
                    onBlur={(e) => setErrores((x) => ({ ...x, [k]: validar(c.id, e.target.value) }))}
                  />
                  {err && (
                    <span id={`e-${k}`} className="campo__error">
                      {err}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}
      <div className="reserva__acciones">
        <button type="submit" className="boton">
          Continuar al pago
        </button>
      </div>
    </form>
  );
}
