import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { obtenerAsientos, obtenerTren } from "../../api/cliente";
import type { Asiento, IdDescuento, IdExtra, IdTarifa, Pasajero, Reserva as TReserva, TipoViajero, Tren } from "../../api/tipos";
import { DESCUENTOS, TARIFAS, calcularTotal } from "../../api/simulado-precios";
import { PasoAsientos } from "./PasoAsientos";
import { PasoViajeros } from "./PasoViajeros";
import { PasoPago } from "./PasoPago";
import { PasoListo } from "./PasoListo";
import { euros, hora } from "./formato";
import "./reserva.css";
import { ciudadDe } from "../../api/tipos";

const PASOS = [
  { id: "asientos", nombre: "Asientos" },
  { id: "viajeros", nombre: "Viajeros" },
  { id: "pago", nombre: "Pago" },
  { id: "listo", nombre: "Listo" },
] as const;
type IdPaso = (typeof PASOS)[number]["id"];

export default function Reserva() {
  const { trenId = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const n = Math.min(Math.max(Number(params.get("pasajeros")) || 1, 1), 8);
  const ninos = Math.min(Math.max(Number(params.get("ninos")) || 0, 0), n - 1);
  const bebes = Math.max(Number(params.get("bebes")) || 0, 0);
  const tarifa = (TARIFAS.find((t) => t.id === params.get("tarifa")) ?? TARIFAS[0]).id as IdTarifa;
  const descuento = (DESCUENTOS.find((d) => d.id === params.get("descuento")) ?? DESCUENTOS[0]).id as IdDescuento;
  // Los últimos asientos son de los niños.
  const tipos: TipoViajero[] = Array.from({ length: n }, (_, i) => (i >= n - ninos ? "nino" : "adulto"));
  const [extras, setExtras] = useState<IdExtra[]>([]);

  const [tren, setTren] = useState<Tren | null>(null);
  const [asientos, setAsientos] = useState<Asiento[] | null>(null);
  const [error, setError] = useState("");
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [pasajeros, setPasajeros] = useState<Pasajero[]>([]);
  const [reserva, setReserva] = useState<TReserva | null>(null);

  useEffect(() => {
    Promise.all([obtenerTren(trenId), obtenerAsientos(trenId)])
      .then(([t, a]) => {
        setTren(t);
        setAsientos(a);
      })
      .catch((e: Error) => setError(e.message));
  }, [trenId]);

  // El paso va en la URL; si alguien llega a un paso sin los datos previos, vuelve al último posible.
  const pedido = (params.get("paso") as IdPaso) || "asientos";
  const maximo: IdPaso = reserva?.estado === "pagada" ? "listo" : pasajeros.length === n && elegidos.length === n ? "pago" : elegidos.length === n ? "viajeros" : "asientos";
  const indiceMax = PASOS.findIndex((p) => p.id === maximo);
  let indice = Math.max(PASOS.findIndex((p) => p.id === pedido), 0);
  if (indice > indiceMax) indice = indiceMax;
  if (reserva?.estado === "pagada") indice = 3;
  const paso = PASOS[indice].id;

  const titulo = useRef<HTMLHeadingElement>(null);
  useEffect(() => titulo.current?.focus(), [paso]);

  const ir = (p: IdPaso) => {
    const s = new URLSearchParams(params);
    s.set("paso", p);
    setParams(s);
    window.scrollTo({ top: 0 });
  };

  if (error)
    return (
      <div className="contenedor seccion" role="alert">
        <p>{error}</p>
        <Link to="/">Vuelve a buscar trenes</Link>
      </div>
    );
  if (!tren || !asientos) return <p className="contenedor seccion cargando">Cargando el tren…</p>;

  const seleccion = elegidos.map((id) => asientos.find((a) => a.id === id)!);
  const desglose = calcularTotal({ precios: seleccion.map((a) => a.precio), tipos, tarifa, descuento, extras });
  const total = desglose.total;
  const nombreTarifa = TARIFAS.find((t) => t.id === tarifa)!.nombre;
  // Ida y vuelta: al pagar la ida se busca la vuelta con los mismos viajeros.
  const vuelta = params.get("vuelta");
  const qVuelta = new URLSearchParams({ origen: tren.destino.id, destino: tren.origen.id, fecha: vuelta ?? "", pasajeros: String(n), tramo: "vuelta", vuelta: vuelta ?? "" });
  if (ninos) qVuelta.set("ninos", String(ninos));
  if (bebes) qVuelta.set("bebes", String(bebes));
  if (descuento !== "ninguno") qVuelta.set("descuento", descuento);
  const enlaceVuelta = vuelta && params.get("tramo") !== "vuelta" ? `/trenes?${qVuelta}` : null;

  return (
    <div className="contenedor seccion reserva">
      <nav aria-label="Pasos de la reserva">
        <ol className="pasos">
          {PASOS.map((p, i) => (
            <li key={p.id} className={i < indice ? "hecho" : i === indice ? "actual" : ""} aria-current={i === indice ? "step" : undefined}>
              <span className="pasos__num" aria-hidden="true">{i < indice ? "✓" : i + 1}</span>
              {p.nombre}
            </li>
          ))}
        </ol>
      </nav>

      <div className="reserva__rejilla">
        <section aria-labelledby="titulo-paso">
          <div className="reserva__cabeza">
            {indice < 3 && (
              <button
                type="button"
                className="enlace-atras"
                onClick={() => (indice === 0 ? history.back() : ir(PASOS[indice - 1].id))}
              >
                <Flecha /> Atrás
              </button>
            )}
            <h1 id="titulo-paso" ref={titulo} tabIndex={-1}>
              {paso === "asientos" && `Elige ${n === 1 ? "tu asiento" : `${n} asientos`}`}
              {paso === "viajeros" && "Datos de los viajeros"}
              {paso === "pago" && "Extras y pago"}
              {paso === "listo" && "Reserva confirmada"}
            </h1>
          </div>

          {paso === "asientos" && (
            <PasoAsientos asientos={asientos} n={n} elegidos={elegidos} onCambio={setElegidos} onSeguir={() => ir("viajeros")} />
          )}
          {paso === "viajeros" && (
            <PasoViajeros
              asientos={seleccion}
              iniciales={pasajeros}
              tipos={tipos}
              onSeguir={(p) => {
                setPasajeros(p.map((x, i) => ({ ...x, tipo: tipos[i] })));
                ir("pago");
              }}
            />
          )}
          {paso === "pago" && (
            <PasoPago
              trenId={tren.id}
              asientos={elegidos}
              pasajeros={pasajeros}
              total={total}
              tarifa={tarifa}
              descuento={descuento}
              bebes={bebes}
              extras={extras}
              onExtras={setExtras}
              onPagada={(r) => {
                setReserva(r);
                ir("listo");
              }}
              onAsientoOcupado={() => {
                setElegidos([]);
                obtenerAsientos(trenId).then(setAsientos);
                ir("asientos");
              }}
            />
          )}
          {paso === "listo" && reserva && <PasoListo reserva={reserva} />}
          {paso === "listo" && enlaceVuelta && (
            <div className="reserva__vuelta cristal">
              <p>Has comprado la ida. Ahora elige el tren de vuelta del {new Date(`${vuelta}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long" })}.</p>
              <Link className="boton" to={enlaceVuelta}>
                Elegir la vuelta
              </Link>
            </div>
          )}
        </section>

        <aside className="resumen cristal" aria-label="Resumen del viaje">
          <p className="resumen__tren">
            {tren.tipo} {tren.numero}
          </p>
          <p className="resumen__ruta">
            <strong>{ciudadDe(tren.origen)}</strong> {hora(tren.salida)}
            <span aria-hidden="true"> → </span>
            <span className="sr-solo"> a </span>
            <strong>{ciudadDe(tren.destino)}</strong> {hora(tren.llegada)}
          </p>
          <p className="resumen__tarifa">
            Tarifa {nombreTarifa}
            {descuento !== "ninguno" && ` · ${DESCUENTOS.find((d) => d.id === descuento)!.nombre}`}
          </p>
          <p className="resumen__viajeros">
            {n - ninos} {n - ninos === 1 ? "adulto" : "adultos"}
            {ninos > 0 && `, ${ninos} ${ninos === 1 ? "niño" : "niños"}`}
            {bebes > 0 && `, ${bebes} ${bebes === 1 ? "bebé" : "bebés"} (gratis, sin asiento)`}
          </p>
          <p className="resumen__asientos">
            {seleccion.length ? `Asientos: ${seleccion.map((a) => `coche ${a.coche}, ${a.fila}${a.letra}`).join("; ")}` : `${n} ${n === 1 ? "viajero" : "viajeros"}`}
          </p>
          {desglose.extras > 0 && (
            <p className="resumen__desglose">
              Billetes {euros.format(desglose.billetes)} · Extras {euros.format(desglose.extras)}
            </p>
          )}
          <p className="resumen__total">
            Total <TotalAnimado valor={total} />
          </p>
        </aside>
      </div>
    </div>
  );
}

function TotalAnimado({ valor }: { valor: number }) {
  const [mostrado, setMostrado] = useState(valor);
  const desde = useRef(valor);
  useEffect(() => {
    const quieto = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const inicio = desde.current;
    if (quieto || inicio === valor) {
      desde.current = valor;
      setMostrado(valor);
      return;
    }
    const t0 = performance.now();
    let id = 0;
    const paso = (t: number) => {
      const k = Math.min((t - t0) / 400, 1);
      const v = inicio + (valor - inicio) * (1 - (1 - k) ** 3);
      desde.current = v;
      setMostrado(v);
      if (k < 1) id = requestAnimationFrame(paso);
    };
    id = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(id);
  }, [valor]);
  return (
    <strong aria-live="polite" aria-atomic="true">
      <span aria-hidden="true">{euros.format(mostrado)}</span>
      <span className="sr-solo">{euros.format(valor)}</span>
    </strong>
  );
}

const Flecha = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
