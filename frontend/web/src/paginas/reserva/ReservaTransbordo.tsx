import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { buscarTransbordos, cancelarReserva, crearReserva } from "@renfe/shared/api/cliente";
import type { OpcionTransbordo, Pasajero, Tren } from "@renfe/shared/api/tipos";
import { useSesion } from "../../estado/sesion";
import { euros, hora } from "./formato";
import "./reserva.css";

const vacio = (): Pasajero => ({ nombre: "", apellidos: "", documento: "", email: "" });
const comprarTramo = (tren: Tren, pasajeros: Pasajero[]) => crearReserva(tren, { trenId: tren.id, asientos: [], pasajeros });

export default function ReservaTransbordo() {
  const { sesion } = useSesion();
  const { pathname, search } = useLocation();
  const [params] = useSearchParams();
  const n = Math.min(Math.max(Number(params.get("pasajeros")) || 1, 1), 6);
  const [opcion, setOpcion] = useState<OpcionTransbordo | null>(null);
  const [pasajeros, setPasajeros] = useState<Pasajero[]>(() => Array.from({ length: n }, vacio));
  const [estado, setEstado] = useState<"elige" | "pagando" | "listo">("elige");
  const [error, setError] = useState("");
  const origen = params.get("origen") ?? "";
  const destino = params.get("destino") ?? "";
  const fecha = params.get("fecha") ?? "";
  const a = params.get("a");
  const b = params.get("b");

  useEffect(() => {
    buscarTransbordos({ origen, destino, fecha }).then(
      (lista) => {
        const elegida = lista.find((o) => o.tramos[0].id === a && o.tramos[1].id === b);
        if (elegida) setOpcion(elegida);
        else setError("Esa combinación ya no está disponible. Vuelve a buscar.");
      },
      (e: Error) => setError(e.message),
    );
  }, [origen, destino, fecha, a, b]);

  if (!sesion) return <Navigate to={`/acceder?volver=${encodeURIComponent(pathname + search)}`} replace />;
  if (!opcion) return <p className="contenedor seccion cargando" role={error ? "alert" : undefined}>{error || "Cargando el viaje…"}</p>;
  const [ida, sigue] = opcion.tramos;

  const cambiar = (i: number, campo: keyof Pasajero, valor: string) =>
    setPasajeros((ps) => ps.map((p, j) => (j === i ? { ...p, [campo]: valor } : p)));

  async function pagar(e: FormEvent) {
    e.preventDefault();
    if (pasajeros.some((p) => !p.nombre.trim() || !p.apellidos.trim() || p.documento.trim().length < 4)) {
      setError("Rellena nombre, apellidos y documento de cada viajero.");
      return;
    }
    setEstado("pagando");
    setError("");
    try {
      const primera = await comprarTramo(ida, pasajeros);
      try {
        await comprarTramo(sigue, pasajeros);
      } catch (fallo) {
        // Sin el segundo tren el primero no sirve: se deshace para no cobrar medio viaje.
        await cancelarReserva(primera.localizador).catch(() => undefined);
        throw fallo;
      }
      window.scrollTo(0, 0);
      setEstado("listo");
    } catch (fallo) {
      setEstado("elige");
      setError(fallo instanceof Error ? fallo.message : "No se pudo completar la compra.");
    }
  }

  if (estado === "listo") {
    return (
      <div className="contenedor seccion" role="status">
        <h1>Viaje comprado</h1>
        <p>Tienes un billete por cada tren. También te los hemos enviado por correo.</p>
        <Link className="boton" to="/billetes">
          Ver mis billetes
        </Link>
      </div>
    );
  }

  return (
    <form className="contenedor seccion" onSubmit={pagar} noValidate>
      <h1>
        {ida.origen.nombre} a {sigue.destino.nombre}
      </h1>
      <p>
        {ida.tipo} {ida.numero}: {hora(ida.salida)} a {hora(ida.llegada)}. Transbordo en <strong>{opcion.transbordo.nombre}</strong>, {opcion.esperaMin} min de espera.
        <br />
        {sigue.tipo} {sigue.numero}: {hora(sigue.salida)} a {hora(sigue.llegada)}.
      </p>
      {pasajeros.map((p, i) => (
        <fieldset key={i} className="tarjeta">
          <legend>Viajero {i + 1}</legend>
          {(
            [
              ["nombre", "Nombre"],
              ["apellidos", "Apellidos"],
              ["documento", "DNI, NIE o pasaporte"],
            ] as const
          ).map(([campo, etiqueta]) => (
            <label key={campo} className="campo">
              <span>{etiqueta}</span>
              <input value={p[campo]} onChange={(e) => cambiar(i, campo, e.target.value)} required />
            </label>
          ))}
        </fieldset>
      ))}
      {error && <p className="campo__error" role="alert">{error}</p>}
      <p>
        Total: <strong>{euros.format(opcion.precio * n)}</strong> (pago simulado)
      </p>
      <button type="submit" className="boton" disabled={estado === "pagando"}>
        {estado === "pagando" ? "Comprando los dos billetes…" : "Comprar los dos billetes"}
      </button>
    </form>
  );
}
