// Mis líneas: favoritas con los próximos trenes de hoy, al estilo de las apps de horarios de autobús.
import { useState, type FormEvent } from "react";
import { buscarEstaciones } from "../api/cliente";
import { Desplegable } from "../componentes/Desplegable";
import { useAvisos } from "../estado/avisos";
import { TarjetaLinea } from "./lineas/TarjetaLinea";
import "./lineas/lineas.css";

async function idDe(nombre: string): Promise<string | undefined> {
  const r = await buscarEstaciones(nombre);
  return (r.find((e) => e.nombre === nombre) ?? (r.length === 1 ? r[0] : undefined))?.id;
}

export default function MisLineas() {
  const { favoritos, alternarFavorito, esFavorita } = useAvisos();
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [error, setError] = useState("");

  async function anadir(e: FormEvent) {
    e.preventDefault();
    const [o, d] = await Promise.all([idDe(origen), idDe(destino)]).catch(() => [undefined, undefined]);
    if (!o || !d) return setError("Elige el origen y el destino de la lista de estaciones.");
    if (o === d) return setError("El origen y el destino tienen que ser distintos.");
    if (esFavorita(o, d)) return setError("Esa línea ya está en tus líneas.");
    alternarFavorito(o, d);
    setOrigen("");
    setDestino("");
    setError("");
  }

  return (
    <div className="contenedor seccion lineas">
      <h1>Mis líneas</h1>
      <p className="lineas__intro">Guarda los trayectos que haces a menudo y mira de un vistazo cuándo sale el próximo tren.</p>

      <form className="lineas__form cristal" onSubmit={anadir} noValidate>
        <Desplegable etiqueta="Origen" texto={origen} onTexto={setOrigen} placeholder="Estación de salida" />
        <Desplegable etiqueta="Destino" texto={destino} onTexto={setDestino} placeholder="Estación de llegada" />
        <button type="submit" className="boton">Añadir línea</button>
        <p className="lineas__error" role="status">{error}</p>
      </form>

      {favoritos.length === 0 ? (
        <div className="lineas__vacio cristal">
          <h2>Aún no tienes líneas</h2>
          <p>
            Añade arriba tu trayecto habitual, por ejemplo de Madrid-Puerta de Atocha a Sevilla-Santa Justa. También puedes
            marcar la estrella en los resultados de búsqueda. Te avisaremos si el próximo tren sale pronto o va con retraso.
          </p>
        </div>
      ) : (
        <ol className="lineas__lista">
          {favoritos.map((f, i) => (
            <li key={f.id}>
              <TarjetaLinea linea={f} primera={i === 0} ultima={i === favoritos.length - 1} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
