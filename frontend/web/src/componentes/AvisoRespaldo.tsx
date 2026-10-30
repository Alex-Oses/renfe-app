import { useSyncExternalStore } from "react";
import { alCambiarRespaldo, usaApiRespaldo } from "@renfe/shared/api/cliente";

export function AvisoRespaldo() {
  const enRespaldo = useSyncExternalStore(alCambiarRespaldo, usaApiRespaldo);
  if (!enRespaldo) return null;
  return (
    <p className="aviso-respaldo" role="status">
      Conectado a Render (respaldo): el Docker no responde.
    </p>
  );
}
