import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ESTACIONES } from "@renfe/shared/api/simulado";
import { buscarEstaciones, usaDatosSimulados } from "@renfe/shared/api/cliente";
import { estacionConocida } from "@renfe/shared/api/estaciones-memoria";
import type { Estacion } from "@renfe/shared/api/tipos";
import { Desplegable } from "./Desplegable";
import { SelectorNumero } from "./ui/SelectorNumero";
import { DESCUENTOS } from "@renfe/shared/api/simulado-precios";
import type { IdDescuento } from "@renfe/shared/api/tipos";
import "./buscador.css";

const normal = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").trim().toLowerCase();
// Acepta el nombre exacto (sin importar tildes ni mayúsculas), el código o una ciudad con una sola estación.
export function porNombre(texto: string) {
  const t = normal(texto);
  if (!t) return undefined;
  const exacta = ESTACIONES.find((e) => normal(e.nombre) === t || e.id === t);
  if (exacta) return exacta;
  const parecidas = ESTACIONES.filter((e) => normal(`${e.nombre} ${e.ciudad}`).includes(t));
  return parecidas.length === 1 ? parecidas[0] : undefined;
}

// Con la API real las estaciones llegan de /estaciones: se busca por nombre exacto o código y, si el
// texto es una ciudad, solo se acepta cuando hay una única estación (si no, que la elija de la lista).
export function elegirEstacion(lista: Estacion[], texto: string): Estacion | undefined {
  const t = normal(texto);
  if (!t) return undefined;
  const exacta = lista.find((e) => normal(e.nombre) === t || e.id === t);
  if (exacta) return exacta;
  return lista.length === 1 ? lista[0] : undefined;
}
const hoy = () => new Date().toISOString().slice(0, 10);
const contar = (uno: string, varios: string) => (n: number) => `${n} ${n === 1 ? uno : varios}`;
export const CLAVE_DESCUENTO = "anden-descuento";
// Descuento guardado en la cuenta (Cuenta > Tarjetas y descuentos), solo como valor por defecto.
export function descuentoGuardado(): IdDescuento {
  try {
    return (localStorage.getItem(CLAVE_DESCUENTO) as IdDescuento | null) ?? "ninguno";
  } catch {
    return "ninguno";
  }
}

interface Props {
  inicial?: { origen?: string; destino?: string; fecha?: string; vuelta?: string; pasajeros?: number; ninos?: number; bebes?: number; descuento?: string };
  compacto?: boolean;
}

export function Buscador({ inicial, compacto }: Props) {
  const navegar = useNavigate();
  // El id de la URL puede venir de la API: se mira primero la memoria de estaciones ya vistas.
  const nombreDe = (id?: string) => estacionConocida(id)?.nombre ?? ESTACIONES.find((e) => e.id === id)?.nombre ?? "";
  const [origen, setOrigen] = useState(nombreDe(inicial?.origen));
  const [destino, setDestino] = useState(nombreDe(inicial?.destino));
  // Estación elegida en la lista: si el texto no cambia, no hace falta volver a resolverlo.
  const [origenElegido, setOrigenElegido] = useState<Estacion | null>(null);
  const [destinoElegido, setDestinoElegido] = useState<Estacion | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [fecha, setFecha] = useState(inicial?.fecha ?? hoy());
  const [vuelta, setVuelta] = useState(inicial?.vuelta ?? "");
  const [idaVuelta, setIdaVuelta] = useState(!!inicial?.vuelta);
  // "pasajeros" en la URL son las plazas (adultos + niños); los bebés van en brazos.
  const [ninos, setNinos] = useState(inicial?.ninos ?? 0);
  const [adultos, setAdultos] = useState(Math.max((inicial?.pasajeros ?? 1) - (inicial?.ninos ?? 0), 1));
  const [bebes, setBebes] = useState(inicial?.bebes ?? 0);
  const [descuento, setDescuento] = useState<string>(inicial?.descuento ?? descuentoGuardado());
  const [giro, setGiro] = useState(0);
  const [error, setError] = useState("");
  // Primero el origen: el destino se abre al elegirlo de la lista o si ya viene de una búsqueda anterior.
  const origenListo = !!origenElegido || (!!origen.trim() && [nombreDe(inicial?.origen), nombreDe(inicial?.destino)].includes(origen));

  async function resolver(texto: string, elegida: Estacion | null): Promise<Estacion | undefined> {
    // Se sigue usando la estación elegida mientras el texto no cambie.
    if (elegida && normal(elegida.nombre) === normal(texto)) return elegida;
    if (usaDatosSimulados) return porNombre(texto);
    if (!texto.trim()) return undefined;
    const lista = await buscarEstaciones(texto.trim()).catch(() => [] as Estacion[]);
    return elegirEstacion(lista, texto);
  }

  async function buscar(e: FormEvent) {
    e.preventDefault();
    setBuscando(true);
    try {
      const [o, d] = await Promise.all([resolver(origen, origenElegido), resolver(destino, destinoElegido)]);
      if (!o || !d) {
        const falta = !o ? (origen.trim() ? `No encontramos «${origen.trim()}» como origen` : "Falta el origen") : destino.trim() ? `No encontramos «${destino.trim()}» como destino` : "Falta el destino";
        setError(`${falta}. Escribe el nombre de la estación o la ciudad y elígela de la lista.`);
        return;
      }
      if (o.id === d.id) {
        setError("El origen y el destino tienen que ser estaciones distintas.");
        return;
      }
      if (idaVuelta && (!vuelta || vuelta < fecha)) {
        setError("La fecha de vuelta tiene que ser igual o posterior a la de ida.");
        return;
      }
      if (adultos + ninos > 9) {
        setError("Como máximo 9 viajeros con asiento por compra.");
        return;
      }
      if (bebes > adultos) {
        setError("Cada bebé tiene que viajar con un adulto.");
        return;
      }
      setError("");
      const q = new URLSearchParams({ origen: o.id, destino: d.id, fecha, pasajeros: String(adultos + ninos) });
      if (idaVuelta) q.set("vuelta", vuelta);
      if (ninos) q.set("ninos", String(ninos));
      if (bebes) q.set("bebes", String(bebes));
      if (descuento !== "ninguno") q.set("descuento", descuento);
      navegar(`/trenes?${q}`);
    } catch (err) {
      setError(`No se han podido comprobar las estaciones: ${(err as Error).message}`);
    } finally {
      setBuscando(false);
    }
  }

  function intercambiar() {
    setOrigen(destino);
    setDestino(origen);
    setOrigenElegido(destinoElegido);
    setDestinoElegido(origenElegido);
    setGiro((g) => g + 180);
  }

  return (
    <form className={`buscador${compacto ? " buscador--compacto" : ""}`} onSubmit={buscar} noValidate>
      <div className="trayecto">
        <div className="trayecto__via" aria-hidden="true" />
        <Desplegable
          etiqueta="Desde"
          texto={origen}
          onTexto={(t) => {
            setOrigen(t);
            setOrigenElegido(null);
          }}
          onElegir={setOrigenElegido}
          placeholder="Estación de origen"
        />
        <button type="button" className="intercambiar" onClick={intercambiar} aria-label="Intercambiar origen y destino">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" style={{ transform: `rotate(${giro}deg)` }}>
            <path d="M7 4v13m0 0-3-3m3 3 3-3M17 20V7m0 0-3 3m3-3 3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <Desplegable
          etiqueta="Hasta"
          texto={destino}
          onTexto={(t) => {
            setDestino(t);
            setDestinoElegido(null);
          }}
          onElegir={setDestinoElegido}
          placeholder={origenListo ? "Estación de destino" : "Elige antes el origen"}
          deshabilitado={!origenListo}
        />
      </div>

      <div className="buscador__modo" role="radiogroup" aria-label="Tipo de viaje">
        <button type="button" role="radio" className="chip" aria-checked={!idaVuelta} onClick={() => setIdaVuelta(false)}>
          Solo ida
        </button>
        <button type="button" role="radio" className="chip" aria-checked={idaVuelta} onClick={() => setIdaVuelta(true)}>
          Ida y vuelta
        </button>
      </div>

      <div className="buscador__pie">
        <label className="campo">
          <span>Fecha de ida</span>
          <input type="date" value={fecha} min={hoy()} onChange={(e) => setFecha(e.target.value)} required />
        </label>
        {idaVuelta && (
          <label className="campo">
            <span>Fecha de vuelta</span>
            <input type="date" value={vuelta} min={fecha} onChange={(e) => setVuelta(e.target.value)} required />
          </label>
        )}
        <SelectorNumero etiqueta="Adultos" valor={adultos} min={1} max={9} onCambio={setAdultos} texto={contar("adulto", "adultos")} />
        <SelectorNumero etiqueta="Niños (4-13)" valor={ninos} min={0} max={8} onCambio={setNinos} texto={contar("niño", "niños")} />
        <SelectorNumero etiqueta="Bebés (0-3)" valor={bebes} min={0} max={4} onCambio={setBebes} texto={contar("bebé", "bebés")} />
        <label className="campo campo--select">
          <span>Tarjeta o descuento</span>
          <select value={descuento} onChange={(e) => setDescuento(e.target.value)}>
            {DESCUENTOS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="boton" disabled={buscando} aria-busy={buscando}>
          {buscando ? "Buscando…" : "Buscar trenes"}
        </button>
      </div>
      {error && (
        <p className="buscador__error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
