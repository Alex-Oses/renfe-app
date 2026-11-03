import * as Notifications from "expo-notifications";
import { useCallback, useRef, useState } from "react";
import { Platform } from "react-native";
import type { ParadaRuta, PosicionTren } from "@renfe/shared/api/tipos";

const MINUTOS_ANTES = 5;

interface Seguimiento {
  estacionId: string;
  notificacion: string | null;
}

// «Avísame al llegar» (como useAvisos de la web): una notificación local 5 min antes de que el
// tren llegue a la parada elegida. Un aviso por tren; pedir otro sustituye al anterior.
// shortcut: se programa con la hora de llegada de ese momento y no se reajusta si el tren se
// retrasa después; si hace falta, reprogramarlo en cada lectura de directo.tsx.
export function useAvisoLlegada() {
  const [seguimientos, setSeguimientos] = useState<Record<string, Seguimiento>>({});
  // Copia síncrona para saber qué notificación cancelar sin esperar al render.
  const actuales = useRef<Record<string, Seguimiento>>({});
  const guardar = (nuevos: Record<string, Seguimiento>) => {
    actuales.current = nuevos;
    setSeguimientos(nuevos);
  };

  const quitar = useCallback(async (trenId: string) => {
    const { [trenId]: viejo, ...resto } = actuales.current;
    guardar(resto);
    if (viejo?.notificacion) await Notifications.cancelScheduledNotificationAsync(viejo.notificacion).catch(() => {});
  }, []);

  const avisar = useCallback(
    async (tren: PosicionTren, parada: ParadaRuta) => {
      await quitar(tren.trenId);
      let notificacion: string | null = null;
      if (Platform.OS !== "web") {
        const permiso = (await Notifications.requestPermissionsAsync().catch(() => null))?.granted ?? false;
        if (permiso) {
          const cuando = Date.parse(parada.llegada) - MINUTOS_ANTES * 60_000;
          notificacion = await Notifications.scheduleNotificationAsync({
            content: {
              title: `${tren.tipo} ${tren.numero} llega a ${parada.nombre}`,
              body: `Llegada prevista en unos ${MINUTOS_ANTES} minutos.`,
            },
            // Si ya faltan menos de 5 min, se avisa en el acto.
            trigger:
              Number.isFinite(cuando) && cuando > Date.now()
                ? { type: Notifications.SchedulableTriggerInputTypes.DATE, date: cuando }
                : null,
          }).catch(() => null);
        }
      }
      guardar({ ...actuales.current, [tren.trenId]: { estacionId: parada.estacionId, notificacion } });
    },
    [quitar],
  );

  const avisaEn = (trenId: string, estacionId: string) => seguimientos[trenId]?.estacionId === estacionId;

  return { avisar, quitar, avisaEn };
}
