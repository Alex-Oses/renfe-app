import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { registrarCara } from "../api/cliente";
import { useSesion } from "../estado/sesion";
import { CamaraFacial } from "./cuenta/CamaraFacial";
import "./cuenta/cuenta.css";

export default function Cuenta() {
  const { sesion, salir, actualizarUsuario } = useSesion();
  const [camara, setCamara] = useState(false);

  if (!sesion) return <Navigate to="/acceder?volver=/cuenta" replace />;
  const { usuario } = sesion;

  return (
    <div className="contenedor seccion cuenta">
      <h1>Hola, {usuario.nombre}</h1>

      <section className="tarjeta" aria-labelledby="cuenta-datos">
        <h2 id="cuenta-datos">Tus datos</h2>
        <dl>
          <dt>Nombre</dt>
          <dd>{usuario.nombre}</dd>
          <dt>Email</dt>
          <dd>{usuario.email}</dd>
        </dl>
      </section>

      <section className="tarjeta" aria-labelledby="cuenta-cara">
        <h2 id="cuenta-cara">Acceso con tu cara</h2>
        <div key={`${camara}-${usuario.caraRegistrada}`} className="aparece">
          {camara ? (
            <CamaraFacial
              titulo={usuario.caraRegistrada ? "Vuelve a registrar tu cara" : "Registra tu cara"}
              textoExito="Listo. Ya puedes entrar con tu cara."
              textoCancelar="Cancelar"
              alCapturar={async (embedding) => {
                await registrarCara(embedding);
                // Deja ver el estado de éxito un instante antes de cerrar la cámara.
                setTimeout(() => {
                  actualizarUsuario({ caraRegistrada: true });
                  setCamara(false);
                }, 1200);
              }}
              alCancelar={() => setCamara(false)}
            />
          ) : usuario.caraRegistrada ? (
            <>
              <p>
                <span className="etiqueta-ok">
                  <svg className="icono" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  Activado
                </span>
              </p>
              <p>Puedes entrar con tu cara desde cualquier navegador con cámara. La contraseña sigue funcionando.</p>
              <button type="button" className="boton boton--secundario" onClick={() => setCamara(true)}>
                Volver a registrar mi cara
              </button>
            </>
          ) : (
            <>
              <p>
                Entra sin escribir la contraseña. Solo guardamos una huella numérica de tu cara, nunca fotos, y la
                contraseña sigue funcionando.
              </p>
              <button type="button" className="boton" onClick={() => setCamara(true)}>
                Activar
              </button>
            </>
          )}
        </div>
      </section>

      <nav className="enlaces-cuenta" aria-label="Accesos rápidos">
        <Link to="/billetes">
          <svg className="icono" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 8a2 2 0 0 0 0 4v4a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-4a2 2 0 0 1 0-4V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1z" />
            <path d="M14 6v11" strokeDasharray="2 2" />
          </svg>
          Mis billetes
        </Link>
        <Link to="/mapa">
          <svg className="icono" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z" />
            <circle cx="12" cy="11" r="2" />
          </svg>
          Trenes en directo
        </Link>
      </nav>

      <div className="zona-salir">
        <button type="button" className="boton boton--peligro" onClick={salir}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
