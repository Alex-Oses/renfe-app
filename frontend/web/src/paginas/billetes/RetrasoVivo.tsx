import { useEffect, useState } from "react";
import { posicionesTrenes } from "@renfe/shared/api/cliente";
import { emparejarTren, seguirRetraso, textoRetraso } from "@renfe/shared/api/retraso-billete";
import type { PosicionTren, Tren } from "@renfe/shared/api/tipos";

const CADA_MS = 30_000;

// «Puntual» o «+N min» del tren del billete, en directo. Sin coincidencia no pinta nada.
export default function RetrasoVivo({ tren }: { tren: Pick<Tren, "numero" | "salida" | "llegada"> }) {
  const [pos, setPos] = useState<PosicionTren | null>(null);
  const activo = seguirRetraso(tren);

  useEffect(() => {
    if (!activo) return;
    let vivo = true;
    let reloj: ReturnType<typeof setInterval> | undefined;
    const pedir = () =>
      posicionesTrenes().then(
        (p) => vivo && setPos(emparejarTren(tren, p)),
        () => {},
      );
    // Solo se consulta con la pestaña visible; al volver se actualiza en el momento.
    const sincronizar = () => {
      clearInterval(reloj);
      reloj = undefined;
      if (document.visibilityState !== "visible") return;
      void pedir();
      reloj = setInterval(pedir, CADA_MS);
    };
    sincronizar();
    document.addEventListener("visibilitychange", sincronizar);
    return () => {
      vivo = false;
      clearInterval(reloj);
      document.removeEventListener("visibilitychange", sincronizar);
    };
  }, [activo, tren]);

  if (!activo || !pos) return null;
  return (
    <span className={`retraso-vivo${pos.retrasoMin > 0 ? " retraso-vivo--tarde" : ""}`} role="status">
      <span className="sr-solo">Estado del tren: </span>
      {textoRetraso(pos)}
    </span>
  );
}
