// Vigila trenes seguidos, billetes próximos y líneas favoritas con un único intervalo.
import { useEffect, useRef, useState } from "react";
import { buscarTrenes, misBilletes, posicionesTrenes } from "@renfe/shared/api/cliente";
import type { Billete } from "@renfe/shared/api/tipos";
import { useAvisos } from "./avisos";
import { novedadesBillete, reglasFavorita, reglasSeguimientos, type AvisoClave } from "@renfe/shared/estado/vigilante-reglas";

const CADA_MS = 20_000;
const CLAVE = "anden.avisados";

function leerEnviados(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(CLAVE) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

export const hoyISO = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function Vigilante() {
  const { avisar, seguimientos, favoritos } = useAvisos();
  const [billetes, setBilletes] = useState<Billete[]>([]);
  const enviados = useRef(leerEnviados());
  const retrasos = useRef(new Map<string, number>());
  // Refs para que el intervalo lea siempre lo último sin reiniciarse en cada cambio.
  const datos = useRef({ avisar, seguimientos, favoritos, billetes });
  datos.current = { avisar, seguimientos, favoritos, billetes };

  useEffect(() => {
    misBilletes().then(setBilletes, () => setBilletes([])); // sin sesión: no hay billetes que vigilar
  }, []);

  const hayAlgo = seguimientos.length > 0 || favoritos.length > 0 || billetes.length > 0;

  useEffect(() => {
    if (!hayAlgo) return;
    let vivo = true;
    async function revisar() {
      const { avisar, seguimientos, favoritos, billetes } = datos.current;
      const ahora = Date.now();
      const nuevos: AvisoClave[] = [];
      try {
        const pos = seguimientos.length || favoritos.length || billetes.length ? await posicionesTrenes() : [];
        nuevos.push(...billetes.flatMap((b) => novedadesBillete(b, ahora, pos)));
        nuevos.push(...reglasSeguimientos(seguimientos, pos, ahora, retrasos.current));
        const listas = await Promise.all(
          favoritos.map((f) => buscarTrenes({ origen: f.origen, destino: f.destino, fecha: hoyISO() }).catch(() => [])),
        );
        for (const l of listas) nuevos.push(...reglasFavorita(l, pos, ahora));
      } catch {
        /* sin red: se reintenta en la próxima vuelta */
      }
      if (!vivo) return;
      for (const { clave, ...a } of nuevos) {
        if (enviados.current.has(clave)) continue;
        enviados.current.add(clave);
        avisar(a);
      }
      try {
        localStorage.setItem(CLAVE, JSON.stringify([...enviados.current].slice(-300)));
      } catch {
        /* sin almacenamiento */
      }
    }
    void revisar();
    const id = setInterval(() => void revisar(), CADA_MS);
    return () => {
      vivo = false;
      clearInterval(id);
    };
  }, [hayAlgo]);

  return null;
}
