import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { resumenAdmin } from "@renfe/shared/api/cliente";
import type { ResumenAdmin } from "@renfe/shared/api/tipos";
import { useSesion } from "../estado/sesion";
import "./revisor/revisor.css";

const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

// Panel de administración: preparado para el próximo sprint.
// Hoy enseña un resumen (GET /admin/resumen, propuesto); las secciones de abajo están por hacer.
export default function Admin() {
  const { sesion } = useSesion();
  const [datos, setDatos] = useState<ResumenAdmin | null>(null);
  const [error, setError] = useState("");
  const esAdmin = sesion?.usuario.rol === "admin";

  useEffect(() => {
    document.title = "Administración | Renfe";
    if (esAdmin) resumenAdmin().then(setDatos, (e: Error) => setError(e.message));
  }, [esAdmin]);

  if (!esAdmin)
    return (
      <div className="contenedor seccion revisor">
        <h1>Administración</h1>
        <p>Esta zona es solo para administradores.</p>
        <p className="revisor__demo cristal">
          Para la demostración: <strong>admin@renfe-app.demo</strong> · contraseña <strong>admin1234</strong>
        </p>
        <Link className="boton" to="/acceder">
          Entrar
        </Link>
      </div>
    );

  return (
    <div className="contenedor seccion admin">
      <h1>Administración</h1>
      {error && <p role="alert">{error}</p>}
      {!datos && !error && <p className="cargando">Cargando…</p>}
      {datos && (
        <>
          <ul className="admin__cifras">
            <Cifra etiqueta="Billetes vendidos" valor={datos.billetesVendidos} />
            <Cifra etiqueta="Reservas" valor={datos.reservas} />
            <Cifra etiqueta="Canceladas" valor={datos.reservasCanceladas} />
            <Cifra etiqueta="Ingresos (simulados)" valor={euros.format(datos.ingresos)} />
            <Cifra etiqueta="Billetes validados" valor={datos.validaciones} />
            <Cifra etiqueta="Usuarios" valor={datos.usuarios} />
          </ul>

          <section className="admin__bloque cristal" aria-labelledby="ultimas">
            <h2 id="ultimas">Últimas reservas</h2>
            {datos.ultimasReservas.length === 0 ? (
              <p>Todavía no hay reservas.</p>
            ) : (
              <div className="tabla">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Localizador</th>
                      <th scope="col">Trayecto</th>
                      <th scope="col">Total</th>
                      <th scope="col">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.ultimasReservas.map((r) => (
                      <tr key={r.localizador}>
                        <th scope="row">{r.localizador}</th>
                        <td>{r.trayecto}</td>
                        <td>{euros.format(r.total)}</td>
                        <td>{r.estado.replace("_", " ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <section className="admin__bloque admin__pendiente" aria-labelledby="pendiente">
        <h2 id="pendiente">Próximamente</h2>
        <ul>
          <li>Gestión de usuarios y roles (dar o quitar el rol de revisor).</li>
          <li>Buscar una reserva por localizador, anularla o reembolsarla.</li>
          <li>Avisos e incidencias que salen en la web.</li>
          <li>Validaciones por tren y revisor.</li>
        </ul>
        <p>Los endpoints están propuestos en el contrato (<code>endpoints.md</code>, sección de administración).</p>
      </section>
    </div>
  );
}

function Cifra({ etiqueta, valor }: { etiqueta: string; valor: number | string }) {
  return (
    <li className="admin__cifra cristal">
      <span>{etiqueta}</span>
      <strong>{valor}</strong>
    </li>
  );
}
