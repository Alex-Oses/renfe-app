// Añadir niño o servicios extra a una reserva existente (precios simulados).
import { useState } from "react";
import type { Reserva } from "@renfe/shared/api/tipos";
import { euros } from "./logica";
import { BuscaReserva, Exito, Herramienta, ResumenReserva, useEnvio } from "./comun";

type Opcion = { id: string; texto: string; precio: number };

function Anadir({ titulo, opciones, prefijo }: { titulo: string; opciones: Opcion[]; prefijo: string }) {
  const [r, setR] = useState<Reserva | null>(null);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const envio = useEnvio(prefijo);
  const total = opciones.filter((o) => sel.has(o.id)).reduce((s, o) => s + o.precio, 0);
  const alternar = (id: string) => setSel((s) => { const n = new Set(s); if (!n.delete(id)) n.add(id); return n; });
  return (
    <Herramienta titulo={titulo}>
      <BuscaReserva filtro={(x) => (x.estado === "cancelada" ? "Esa reserva está anulada." : null)} onReserva={(x) => { setR(x); setSel(new Set()); envio.reiniciar(); }} />
      {r && (
        <div aria-live="polite">
          <ResumenReserva r={r} />
          {envio.exp ? (
            <Exito>Añadido a tu reserva. Expediente <strong>{envio.exp}</strong>. Total: {euros(total)} (simulado).</Exito>
          ) : (
            <>
              <fieldset className="herr__opciones">
                <legend>Elige qué añadir</legend>
                {opciones.map((o) => (
                  <label key={o.id}>
                    <input type="checkbox" checked={sel.has(o.id)} onChange={() => alternar(o.id)} /> {o.texto} ({euros(o.precio)})
                  </label>
                ))}
              </fieldset>
              <p>Total: <strong>{euros(total)}</strong></p>
              <button className="boton" onClick={envio.enviar} disabled={!sel.size || envio.enviando}>{envio.enviando ? "Añadiendo…" : "Añadir"}</button>
            </>
          )}
        </div>
      )}
    </Herramienta>
  );
}

export const AnadeNino = () => (
  <Anadir titulo="Añade un niño a tu viaje" prefijo="NIN" opciones={[
    { id: "menor4", texto: "Niño menor de 4 años sin asiento", precio: 0 },
    { id: "nino", texto: "Niño de 4 a 13 años con asiento (40 % dto.)", precio: 18 },
  ]} />
);

export const AnadeExtras = () => (
  <Anadir titulo="Añade servicios a tu billete" prefijo="EXT" opciones={[
    { id: "mascota", texto: "Mascota (hasta 10 kg)", precio: 25 },
    { id: "bici", texto: "Bicicleta", precio: 10 },
    { id: "equipaje", texto: "Equipaje extra", precio: 15 },
    { id: "parking", texto: "Parking en estación (24 h)", precio: 12 },
  ]} />
);
