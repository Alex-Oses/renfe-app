import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { iniciarSesion, registrarse, verificarCara } from "@renfe/shared/api/cliente";
import { useSesion } from "../estado/sesion";
import { CamaraFacial } from "./cuenta/CamaraFacial";
import { CampoContrasena } from "./cuenta/CampoContrasena";
import "./cuenta/cuenta.css";

type Pestana = "entrar" | "crear";
type Errores = { nombre?: string; email?: string; contrasena?: string; general?: string };

// Reparte el mensaje de la API junto al campo al que se refiere.
function repartir(mensaje: string): Errores {
  if (/email/i.test(mensaje)) return { email: mensaje };
  if (/contraseña/i.test(mensaje)) return { contrasena: mensaje };
  if (/nombre/i.test(mensaje)) return { nombre: mensaje };
  return { general: mensaje };
}

export default function Acceder() {
  const { sesion, entrar } = useSesion();
  const navegar = useNavigate();
  const [params] = useSearchParams();
  const volverA = params.get("volver") ?? "";
  // Solo rutas internas: evita redirecciones abiertas a otros dominios.
  const destino = /^\/(?![/\\])/.test(volverA) ? volverA : "/cuenta";

  const [pestana, setPestana] = useState<Pestana>("entrar");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);
  const [conCara, setConCara] = useState(false);

  useEffect(() => {
    if (sesion) navegar(destino, { replace: true });
  }, [sesion, destino, navegar]);

  function cambiar(p: Pestana) {
    setPestana(p);
    setErrores({});
    setConCara(false);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErrores({});
    setEnviando(true);
    try {
      entrar(
        pestana === "entrar"
          ? await iniciarSesion({ email, contrasena })
          : await registrarse({ nombre, email, contrasena }),
      );
    } catch (err) {
      setErrores(repartir((err as Error).message));
    } finally {
      setEnviando(false);
    }
  }

  function abrirCara() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrores({ email: "Escribe el email de tu cuenta para entrar con tu cara." });
      document.getElementById("acc-email")?.focus();
      return;
    }
    setErrores({});
    setConCara(true);
  }

  const campoEmail = (
    <div className="campo">
      <label htmlFor="acc-email">Email</label>
      <input
        id="acc-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        inputMode="email"
        required
        aria-invalid={!!errores.email}
        aria-describedby={errores.email ? "acc-email-error" : undefined}
      />
      {errores.email && (
        <p id="acc-email-error" className="campo__error">
          {errores.email}
        </p>
      )}
    </div>
  );

  return (
    <div className="contenedor seccion acceso">
      <h1>{pestana === "entrar" ? "Entra en tu cuenta" : "Crea tu cuenta"}</h1>
      <div className="pestanas" role="tablist" aria-label="Acceso">
        {(["entrar", "crear"] as const).map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            id={`tab-${p}`}
            aria-selected={pestana === p}
            aria-controls="panel-acceso"
            onClick={() => cambiar(p)}
          >
            {p === "entrar" ? "Entrar" : "Crear cuenta"}
          </button>
        ))}
      </div>

      <div id="panel-acceso" role="tabpanel" aria-labelledby={`tab-${pestana}`} key={pestana + conCara} className="aparece">
        {conCara ? (
          <CamaraFacial
            titulo="Entrar con tu cara"
            textoExito="Te hemos reconocido. Entrando…"
            alCapturar={async (embedding) => entrar(await verificarCara({ email, embedding }))}
            alCancelar={() => setConCara(false)}
          />
        ) : (
          <form className="formulario" onSubmit={enviar} noValidate>
            {pestana === "crear" && (
              <div className="campo">
                <label htmlFor="acc-nombre">Nombre</label>
                <input
                  id="acc-nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  autoComplete="name"
                  required
                  aria-invalid={!!errores.nombre}
                  aria-describedby={errores.nombre ? "acc-nombre-error" : undefined}
                />
                {errores.nombre && (
                  <p id="acc-nombre-error" className="campo__error">
                    {errores.nombre}
                  </p>
                )}
              </div>
            )}
            {campoEmail}
            <CampoContrasena
              id="acc-contrasena"
              etiqueta="Contraseña"
              valor={contrasena}
              alCambiar={setContrasena}
              autoComplete={pestana === "entrar" ? "current-password" : "new-password"}
              error={errores.contrasena}
              conFuerza={pestana === "crear"}
            />
            {errores.general && (
              <p className="campo__error" role="alert">
                {errores.general}
              </p>
            )}
            <button className="boton" type="submit" disabled={enviando}>
              {enviando ? "Un momento…" : pestana === "entrar" ? "Entrar" : "Crear cuenta"}
            </button>
            {pestana === "entrar" && (
              <>
                <p className="separador">o</p>
                <button type="button" className="boton boton--secundario boton--icono" onClick={abrirCara}>
                  <svg className="icono" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
                    <path d="M9 10v1M15 10v1M9.5 15.5a3.5 3.5 0 0 0 5 0" />
                  </svg>
                  Entrar con tu cara
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
