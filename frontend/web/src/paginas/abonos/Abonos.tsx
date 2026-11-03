import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { comprarAbono } from "@renfe/shared/api/cliente";
import { ESTACIONES } from "@renfe/shared/api/simulado";
import { TIPOS_ABONO, finAbono, hoyIso, infoAbono, sumarDias } from "@renfe/shared/api/simulado-abonos";
import type { TipoAbono } from "@renfe/shared/api/tipos";
import {
  compraConfirmada,
  compraEnviando,
  compraFallida,
  compraInicial,
  type ResultadoCompraAbono,
} from "@renfe/shared/api/resultado-compra";
import { useSesion } from "../../estado/sesion";
import { euros, fecha } from "@renfe/shared/formato/formato";
import { TornosFaciales } from "./TornosFaciales";
import "./abonos.css";

const aFecha = (iso: string) => fecha(`${iso}T12:00:00`);

export default function Abonos() {
  const { sesion } = useSesion();
  const hoy = hoyIso();
  const [tipo, setTipo] = useState<TipoAbono>("ave-ld-mensual");
  const [origenId, setOrigen] = useState("");
  const [destinoId, setDestino] = useState("");
  const [inicio, setInicio] = useState(hoy);
  const [resultado, setResultado] = useState<ResultadoCompraAbono>(compraInicial);
  const comprado = resultado.estado === "exito" ? resultado.abono : null;
  const cargando = resultado.estado === "enviando";
  const error = resultado.estado === "error" ? resultado.mensaje : "";

  if (!sesion) return <Navigate to="/acceder?volver=/abonos" replace />;
  const info = infoAbono(tipo);

  const pagar = async (e: FormEvent) => {
    e.preventDefault();
    setResultado(compraEnviando());
    try {
      const abono = await comprarAbono(info.trayecto ? { tipo, origenId, destinoId, inicio } : { tipo, inicio });
      setResultado(compraConfirmada(abono));
    } catch (err) {
      setResultado(compraFallida((err as Error).message));
    }
  };

  return (
    <div className="contenedor seccion abonos">
      <h1>Abonos y bonos</h1>
      <p>Compra un abono para viajar a menudo. Es una simulación: no se cobra nada.</p>

      {comprado ? (
        <section
          className="tarjeta aparece abonos__exito"
          aria-labelledby="abono-listo"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="abonos__exito-marca">
            <span aria-hidden="true">✓</span> Pago confirmado
          </p>
          <h2 id="abono-listo">Abono comprado</h2>
          <p>
            {comprado.nombre}
            {comprado.origen && ` · ${comprado.origen.nombre} – ${comprado.destino?.nombre}`}. Válido del {aFecha(comprado.inicio)} al{" "}
            {aFecha(comprado.fin)}.
          </p>
          <div className="abonos__acciones">
            <Link className="boton" to="/cuenta#mis-abonos">
              Ver el QR en Mis abonos
            </Link>
            <button type="button" className="boton boton--secundario" onClick={() => setResultado(compraInicial())}>
              Comprar otro
            </button>
          </div>
        </section>
      ) : (
        <form className="tarjeta abonos__form" onSubmit={pagar} aria-busy={cargando}>
          <fieldset className="abonos__tipos">
            <legend>1. Elige el tipo</legend>
            {TIPOS_ABONO.map((t) => (
              <label key={t.tipo} className="abonos__tipo">
                <input type="radio" name="tipo" value={t.tipo} checked={tipo === t.tipo} onChange={() => setTipo(t.tipo)} />
                <span className="abonos__tipo-nombre">{t.nombre}</span>
                <span className="abonos__tipo-desc">{t.descripcion}</span>
                <span className="abonos__tipo-precio">{euros(t.precio)}</span>
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend>2. {info.trayecto ? "Trayecto y fecha de inicio" : "Fecha de inicio"}</legend>
            <div className="abonos__campos">
              {info.trayecto && (
                <>
                  <label className="campo campo--select">
                    <span>Origen</span>
                    <select required value={origenId} onChange={(e) => setOrigen(e.target.value)}>
                      <option value="">Elige estación</option>
                      {ESTACIONES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="campo campo--select">
                    <span>Destino</span>
                    <select required value={destinoId} onChange={(e) => setDestino(e.target.value)}>
                      <option value="">Elige estación</option>
                      {ESTACIONES.filter((s) => s.id !== origenId).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}
              <label className="campo">
                <span>Empieza el</span>
                <input type="date" required min={hoy} max={sumarDias(hoy, 60)} value={inicio} onChange={(e) => setInicio(e.target.value)} />
              </label>
            </div>
            {inicio && <p className="abonos__validez">Válido hasta el {aFecha(finAbono(tipo, inicio))}{info.viajes ? `, ${info.viajes} viajes` : ", viajes ilimitados"}.</p>}
          </fieldset>

          <fieldset>
            <legend>3. Pago</legend>
            <p>
              Pago en modo prueba: no se pide tarjeta ni se cobra nada. Al pulsar el botón el abono queda guardado en tu cuenta.
            </p>
            {error && (
              <p className="abonos__error" role="alert" aria-live="assertive">
                {error}
              </p>
            )}
            {cargando && (
              <p className="abonos__procesando" role="status" aria-live="polite">
                Procesando el pago…
              </p>
            )}
            <button type="submit" className="boton" disabled={cargando}>
              {cargando ? (
                <>
                  <span className="girador" aria-hidden="true" /> Procesando el pago…
                </>
              ) : (
                `Pagar ${euros(info.precio)} (simulado)`
              )}
            </button>
          </fieldset>
        </form>
      )}

      <TornosFaciales />
    </div>
  );
}
