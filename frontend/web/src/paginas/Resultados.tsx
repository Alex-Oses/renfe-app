import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { buscarTrenes } from "../api/cliente";
import type { Tren } from "../api/tipos";
import { Buscador } from "../componentes/Buscador";

const minutos = (iso: string) => {
  const [h, m] = iso.slice(11, 16).split(":").map(Number);
  return h * 60 + m;
};
const duracion = (t: Tren) => (new Date(t.llegada).getTime() - new Date(t.salida).getTime()) / 60_000;
const textoDuracion = (min: number) => `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")}`;
const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

function moverDia(fecha: string, dias: number) {
  const f = new Date(`${fecha}T12:00:00`);
  f.setDate(f.getDate() + dias);
  return f.toISOString().slice(0, 10);
}

export function Resultados() {
  const [params] = useSearchParams();
  const origen = params.get("origen") ?? "";
  const destino = params.get("destino") ?? "";
  const fecha = params.get("fecha") ?? "";
  const [trenes, setTrenes] = useState<Tren[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setTrenes(null);
    setError("");
    buscarTrenes({ origen, destino, fecha })
      .then(setTrenes)
      .catch((e: Error) => setError(e.message));
  }, [origen, destino, fecha]);

  // Escala común: la barra de cada tren ocupa su franja real dentro del día.
  const inicio = trenes?.length ? Math.min(...trenes.map((t) => minutos(t.salida))) : 0;
  const fin = trenes?.length ? Math.max(...trenes.map((t) => minutos(t.salida) + duracion(t))) : 1;
  const fechaLarga = fecha
    ? new Date(`${fecha}T12:00:00`).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })
    : "";
  const enlaceDia = (d: number) => `/trenes?${new URLSearchParams({ origen, destino, fecha: moverDia(fecha, d) })}`;

  return (
    <div className="contenedor seccion">
      <Buscador key={`${origen}${destino}${fecha}`} inicial={{ origen, destino, fecha }} compacto />

      <div className="resultados__cabecera">
        <h1>
          {trenes?.[0] ? `${trenes[0].origen.ciudad} a ${trenes[0].destino.ciudad}` : "Trenes"}
          <span className="resultados__fecha">{fechaLarga}</span>
        </h1>
        <nav className="dias" aria-label="Cambiar de día">
          <Link to={enlaceDia(-1)}>Día anterior</Link>
          <Link to={enlaceDia(1)}>Día siguiente</Link>
        </nav>
      </div>

      {error && <p className="aviso" role="alert">No se han podido cargar los trenes: {error}. Vuelve a intentarlo.</p>}
      {!error && trenes === null && <p className="aviso">Buscando trenes…</p>}
      {trenes?.length === 0 && (
        <p className="aviso">No hay trenes para este trayecto. Prueba con otra estación o con otro día.</p>
      )}

      {trenes && trenes.length > 0 && (
        <ol className="trenes">
          {trenes.map((t) => {
            const dur = duracion(t);
            const izquierda = ((minutos(t.salida) - inicio) / (fin - inicio)) * 100;
            const ancho = (dur / (fin - inicio)) * 100;
            const completo = t.plazasLibres === 0;
            return (
              <li key={t.id} className={`tren${completo ? " tren--completo" : ""}`}>
                <div className="tren__horas">
                  <time dateTime={t.salida}>{t.salida.slice(11, 16)}</time>
                  <span className="tren__duracion">{textoDuracion(dur)}</span>
                  <time dateTime={t.llegada}>{t.llegada.slice(11, 16)}</time>
                </div>
                <div className="tren__linea" aria-hidden="true">
                  <span style={{ left: `${izquierda}%`, width: `${ancho}%` }} />
                </div>
                <div className="tren__info">
                  <span className="tren__tipo">{t.tipo}</span> {t.numero}
                </div>
                <div className="tren__compra">
                  {completo ? (
                    <span className="tren__agotado">Completo</span>
                  ) : (
                    <>
                      <span className="tren__precio">{euros.format(t.precioDesde)}</span>
                      <button className="boton boton--secundario" type="button" disabled title="Disponible en el próximo sprint">
                        Elegir
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
