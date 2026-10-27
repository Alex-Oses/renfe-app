import { useEffect, useRef, useState } from "react";
import { leerDeLienzo } from "./decodificar";

type Estado = "arrancando" | "leyendo" | "sin-camara" | "denegada";

// Cámara trasera leyendo QR continuamente; avisa una vez por código y se para.
export function Escaner({ alLeer }: { alLeer: (texto: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [estado, setEstado] = useState<Estado>("arrancando");
  const avisar = useRef(alLeer);
  avisar.current = alLeer;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let vivo = true;
    let temporizador = 0;
    const lienzo = document.createElement("canvas");

    const mirar = async () => {
      const v = video.current;
      if (!vivo || !v) return;
      if (v.readyState >= 2 && v.videoWidth) {
        lienzo.width = v.videoWidth;
        lienzo.height = v.videoHeight;
        lienzo.getContext("2d", { willReadFrequently: true })?.drawImage(v, 0, 0);
        const texto = await leerDeLienzo(lienzo);
        if (texto && vivo) {
          navigator.vibrate?.(80);
          avisar.current(texto);
          return;
        }
      }
      temporizador = window.setTimeout(mirar, 180);
    };

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) return setEstado("sin-camara");
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } } });
      } catch (e) {
        return setEstado((e as Error).name === "NotAllowedError" ? "denegada" : "sin-camara");
      }
      if (!vivo || !video.current) return stream.getTracks().forEach((t) => t.stop());
      video.current.srcObject = stream;
      await video.current.play().catch(() => undefined);
      setEstado("leyendo");
      void mirar();
    })();

    return () => {
      vivo = false;
      clearTimeout(temporizador);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="escaner">
      <video ref={video} className="escaner__video" muted playsInline aria-hidden="true" />
      <div className="escaner__marco" aria-hidden="true" />
      <p className="escaner__estado" role="status">
        {estado === "arrancando" && "Abriendo la cámara…"}
        {estado === "leyendo" && "Apunta al QR del billete"}
        {estado === "denegada" && "Sin permiso para la cámara. Actívalo en el navegador o sube una foto del QR."}
        {estado === "sin-camara" && "Este dispositivo no tiene cámara disponible. Sube una foto del QR o pega el código."}
      </p>
    </div>
  );
}
