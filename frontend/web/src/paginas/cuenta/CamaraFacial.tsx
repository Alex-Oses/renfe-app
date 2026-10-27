// Cámara para el acceso con la cara. Todo el análisis ocurre en el navegador con Human:
// ningún fotograma sale del dispositivo, solo el embedding (una lista de números).
import { useEffect, useRef, useState } from "react";
import type { EmbeddingFacial } from "../../api/tipos";
import "./cuenta.css";

type Estado = "permiso" | "cargando" | "capturando" | "enviando" | "exito" | "error" | "sin-permiso" | "sin-camara";

interface Props {
  titulo: string;
  // Recibe el embedding y hace la llamada a la API. Si lanza, se muestra el error.
  alCapturar: (embedding: EmbeddingFacial) => Promise<void>;
  alCancelar: () => void;
  textoExito: string;
  textoCancelar?: string;
}

const FOTOGRAMAS = 12; // fotogramas buenos seguidos que hacen falta
const MIN_VIDA = 0.5; // puntuación mínima de liveness y antispoof

let humanCompartido: import("@vladmandic/human").Human | undefined;

export function CamaraFacial({ titulo, alCapturar, alCancelar, textoExito, textoCancelar = "Usar la contraseña" }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const [estado, setEstado] = useState<Estado>("permiso");
  const [guia, setGuia] = useState("Centra tu cara");
  const [progreso, setProgreso] = useState(0);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);
  // La función más reciente sin reiniciar la cámara si el padre se vuelve a pintar.
  const capturar = useRef(alCapturar);
  capturar.current = alCapturar;

  useEffect(() => {
    let vivo = true;
    let stream: MediaStream | null = null;

    (async () => {
      setEstado("permiso");
      setProgreso(0);
      setGuia("Centra tu cara");
      if (!navigator.mediaDevices?.getUserMedia) return setEstado("sin-camara");
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } });
      } catch (e) {
        const nombre = (e as DOMException).name;
        if (vivo) setEstado(nombre === "NotAllowedError" || nombre === "SecurityError" ? "sin-permiso" : "sin-camara");
        return;
      }
      if (!vivo) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      const v = video.current!;
      v.srcObject = stream;
      await v.play().catch(() => undefined);

      setEstado("cargando");
      // Import dinámico: Human y sus modelos pesan varios MB y solo se bajan al abrir la cámara.
      const { Human } = await import("@vladmandic/human");
      // Una sola instancia por página: cada `new Human` reserva memoria WebGL que no se libera sola.
      const human = (humanCompartido ??= new Human({
        modelBasePath: "https://cdn.jsdelivr.net/npm/@vladmandic/human/models/",
        backend: "webgl",
        filter: { enabled: true, equalization: true },
        face: {
          enabled: true,
          detector: { rotation: false, maxDetected: 1, return: false },
          mesh: { enabled: true },
          iris: { enabled: false },
          emotion: { enabled: false },
          description: { enabled: true },
          antispoof: { enabled: true },
          liveness: { enabled: true },
        },
        body: { enabled: false },
        hand: { enabled: false },
        object: { enabled: false },
        gesture: { enabled: false },
        segmentation: { enabled: false },
      }));
      try {
        await human.load();
        await human.warmup();
      } catch {
        if (vivo) {
          setError("No se han podido cargar los modelos de reconocimiento. Revisa la conexión.");
          setEstado("error");
        }
        return;
      }
      if (!vivo) return;
      setEstado("capturando");

      const embeddings: number[][] = [];
      let anterior: number[] | null = null;
      while (vivo && embeddings.length < FOTOGRAMAS) {
        const r = await human.detect(v);
        const cara = r.face[0];
        let aviso = "";
        if (!cara) aviso = "Centra tu cara";
        else {
          const [x, y, w, h] = cara.boxRaw;
          const cx = x + w / 2;
          const cy = y + h / 2;
          const movido = anterior && Math.hypot(cx - anterior[0], cy - anterior[1]) > 0.04;
          anterior = [cx, cy];
          if (w < 0.28) aviso = "Acércate un poco";
          else if (Math.abs(cx - 0.5) > 0.15 || Math.abs(cy - 0.5) > 0.18) aviso = "Centra tu cara";
          else if (movido) aviso = "Mantente quieto";
          else if ((cara.real ?? 0) < MIN_VIDA || (cara.live ?? 0) < MIN_VIDA) aviso = "Mira a la cámara, con buena luz";
          else if (!cara.embedding?.length) aviso = "Mantente quieto";
        }
        if (!vivo) break;
        if (aviso) embeddings.length = 0;
        else embeddings.push(cara!.embedding!);
        setGuia(aviso || "Mantente quieto");
        setProgreso(embeddings.length / FOTOGRAMAS);
        await new Promise((ok) => setTimeout(ok, 60));
      }
      if (!vivo) return;

      // La cámara ya no hace falta: se apaga antes de llamar a la API.
      stream.getTracks().forEach((t) => t.stop());
      const media = embeddings[0].map((_, i) => embeddings.reduce((s, e) => s + e[i], 0) / embeddings.length);
      setEstado("enviando");
      try {
        await capturar.current(media);
        if (vivo) setEstado("exito");
      } catch (e) {
        if (vivo) {
          setError((e as Error).message);
          setEstado("error");
        }
      }
    })().catch((e: unknown) => {
      if (vivo) {
        setError((e as Error).message || "Algo ha fallado con la cámara.");
        setEstado("error");
      }
    });

    return () => {
      vivo = false;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [intento]);

  const enCamara = estado === "cargando" || estado === "capturando" || estado === "permiso";
  const mensaje: Record<Estado, string> = {
    permiso: "Tu navegador te pedirá permiso para usar la cámara.",
    cargando: "Preparando el reconocimiento. La primera vez tarda unos segundos.",
    capturando: guia,
    enviando: "Comprobando…",
    exito: textoExito,
    error,
    "sin-permiso":
      "No tenemos permiso para usar la cámara. Púlsalo en el icono del candado o de la cámara de la barra de direcciones, permite la cámara y vuelve a intentarlo.",
    "sin-camara": "No encontramos ninguna cámara en este dispositivo.",
  };

  return (
    <section className="camara cristal" aria-labelledby="camara-titulo">
      <h2 id="camara-titulo" className="camara__titulo">
        {titulo}
      </h2>
      <div className={`camara__visor camara__visor--${estado}`} aria-hidden="true">
        <video ref={video} className="camara__video" muted playsInline hidden={!enCamara && estado !== "enviando"} />
        <svg className="camara__anillo" viewBox="0 0 100 100">
          <circle className="camara__pista" cx="50" cy="50" r="47" />
          <circle
            className="camara__barra"
            cx="50"
            cy="50"
            r="47"
            pathLength={100}
            strokeDasharray={`${Math.round(progreso * 100)} 100`}
          />
        </svg>
        {estado === "exito" && (
          <svg className="camara__icono" viewBox="0 0 24 24">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        )}
        {(estado === "error" || estado === "sin-permiso" || estado === "sin-camara") && (
          <svg className="camara__icono camara__icono--error" viewBox="0 0 24 24">
            <path d="M12 7v6M12 16.5v.5" />
          </svg>
        )}
      </div>
      <p className="camara__mensaje" role="status" aria-live="polite">
        {mensaje[estado]}
      </p>
      {estado === "capturando" && (
        <div
          className="camara__progreso"
          role="progressbar"
          aria-label="Captura de la cara"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progreso * 100)}
        >
          <span style={{ width: `${progreso * 100}%` }} />
        </div>
      )}
      <p className="camara__privacidad">Las imágenes no salen de tu dispositivo. Solo guardamos una huella numérica de tu cara.</p>
      <div className="camara__acciones">
        {(estado === "error" || estado === "sin-permiso") && (
          <button type="button" className="boton" onClick={() => setIntento((n) => n + 1)}>
            Intentar otra vez
          </button>
        )}
        {estado !== "exito" && (
          <button type="button" className="boton boton--secundario" onClick={alCancelar}>
            {textoCancelar}
          </button>
        )}
      </div>
    </section>
  );
}
