// Vigilante de la app, como estado/vigilante.tsx de la web: cada 20 s, con sesión, revisa los
// billetes y las líneas favoritas y lanza notificaciones locales (Expo Go no admite push remoto).
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";
import { buscarTrenes, misBilletes, posicionesTrenes } from "@renfe/shared/api/cliente";
import type { LineaFavorita } from "@renfe/shared/api/tipos";
import { novedadesBillete, reglasFavorita, type AvisoClave } from "@renfe/shared/estado/vigilante-reglas";
import { leerSesion } from "@/sesion";

const CADA_MS = 20_000;
const CLAVE = "anden.avisados";

const hoy = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function leer<T>(clave: string, porDefecto: T): T {
  try {
    return (JSON.parse(localStorage.getItem(clave) ?? "null") as T) ?? porDefecto;
  } catch {
    return porDefecto;
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

export function Vigilante() {
  useEffect(() => {
    if (Platform.OS === "web") return; // en web avisa la propia web
    let vivo = true;
    let permiso: boolean | null = null;
    const enviados = new Set(leer<string[]>(CLAVE, []));

    async function revisar() {
      if (!leerSesion()) return;
      if (permiso === null) permiso = (await Notifications.requestPermissionsAsync().catch(() => null))?.granted ?? false;
      if (!permiso) return;
      const nuevos: AvisoClave[] = [];
      try {
        const billetes = await misBilletes();
        const favoritos = leer<LineaFavorita[]>("anden.favoritos", []);
        const pos = billetes.length || favoritos.length ? await posicionesTrenes() : [];
        const ahora = Date.now();
        nuevos.push(...billetes.flatMap((b) => novedadesBillete(b, ahora, pos)));
        const listas = await Promise.all(
          favoritos.map((f) => buscarTrenes({ origen: f.origen, destino: f.destino, fecha: hoy() }).catch(() => [])),
        );
        for (const l of listas) nuevos.push(...reglasFavorita(l, pos, ahora));
      } catch {
        /* sin red: se reintenta en la próxima vuelta */
      }
      if (!vivo) return;
      for (const a of nuevos) {
        if (enviados.has(a.clave)) continue;
        enviados.add(a.clave);
        await Notifications.scheduleNotificationAsync({ content: { title: a.titulo, body: a.texto }, trigger: null }).catch(() => {});
      }
      try {
        localStorage.setItem(CLAVE, JSON.stringify([...enviados].slice(-300)));
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
  }, []);
  return null;
}
