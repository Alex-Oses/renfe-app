import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/** «Reducir movimiento» del sistema, con su aviso de cambio (como en EntradaTren y Revela). */
export function useReducirMovimiento() {
  const [reducir, setReducir] = useState(false);
  useEffect(() => {
    let vivo = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((valor) => vivo && setReducir(valor));
    const suscripcion = AccessibilityInfo.addEventListener("reduceMotionChanged", setReducir);
    return () => {
      vivo = false;
      suscripcion.remove();
    };
  }, []);
  return reducir;
}
