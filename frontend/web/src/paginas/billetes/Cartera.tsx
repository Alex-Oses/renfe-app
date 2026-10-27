import { useState } from "react";
import QRCode from "qrcode";
import { enlaceWallet } from "../../api/cliente";
import type { Billete, EnlaceWallet } from "../../api/tipos";
import { fecha, hora } from "../reserva/formato";

type Plataforma = EnlaceWallet["plataforma"];

// Apple en iOS/macOS, Google en Android; en el resto (escritorio Windows/Linux) las dos.
export function plataformas(ua: string): Plataforma[] {
  if (/android/i.test(ua)) return ["google"];
  if (/iphone|ipad|ipod|macintosh/i.test(ua)) return ["apple"];
  return ["apple", "google"];
}

const AVISO: Record<Plataforma, string> = {
  apple:
    "Todavía no podemos crear el pase de Apple Wallet: la API tiene que generarlo como archivo .pkpass firmado con el certificado de nuestro Pass Type ID. Mientras tanto, guarda el billete como imagen.",
  google:
    "Todavía no podemos crear el pase de Google Wallet: la API tiene que firmar un JWT con la cuenta de servicio del emisor. Mientras tanto, guarda el billete como imagen.",
};

function IconoCartera() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="6" width="18" height="14" rx="3" />
      <path d="M3 10h18M16 15h2M6 6l9-3 1 3" />
    </svg>
  );
}

export default function Cartera({ billete }: { billete: Billete }) {
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState<Plataforma | "imagen" | null>(null);

  async function anadir(p: Plataforma) {
    setOcupado(p);
    setAviso("");
    try {
      const { url } = await enlaceWallet(billete.id, p);
      window.location.assign(url);
    } catch {
      setAviso(AVISO[p]);
    } finally {
      setOcupado(null);
    }
  }

  async function guardarImagen() {
    setOcupado("imagen");
    try {
      const enlace = document.createElement("a");
      enlace.href = (await dibujar(billete)).toDataURL("image/png");
      enlace.download = `billete-${billete.id}.png`;
      enlace.click();
    } catch {
      setAviso("No hemos podido crear la imagen. Prueba a imprimir el billete.");
    } finally {
      setOcupado(null);
    }
  }

  return (
    <section className="cartera no-imprimir" aria-labelledby="t-cartera">
      <h2 id="t-cartera">Llévalo en el móvil</h2>
      <div className="cartera__botones">
        {plataformas(navigator.userAgent).map((p) => (
          <button key={p} type="button" className="boton-cartera" onClick={() => anadir(p)} disabled={ocupado !== null}>
            <IconoCartera />
            {p === "apple" ? "Añadir a Apple Wallet" : "Guardar en Google Wallet"}
          </button>
        ))}
        <button type="button" className="boton boton--secundario" onClick={guardarImagen} disabled={ocupado !== null}>
          {ocupado === "imagen" ? "Creando imagen…" : "Guardar el billete como imagen"}
        </button>
      </div>
      <p className="cartera__aviso" role="status">
        {aviso}
      </p>
    </section>
  );
}

// Dibuja el billete a mano en un canvas (sin capturar el DOM) para guardarlo sin conexión.
async function dibujar(b: Billete): Promise<HTMLCanvasElement> {
  const c = document.createElement("canvas");
  c.width = 720;
  c.height = 1080;
  const x = c.getContext("2d");
  if (!x) throw new Error("Sin canvas");
  x.fillStyle = "#EFF3F6";
  x.fillRect(0, 0, 720, 1080);
  x.fillStyle = "#fff";
  x.beginPath();
  x.roundRect(30, 30, 660, 1020, 32);
  x.fill();
  x.fillStyle = "#81005E";
  x.beginPath();
  x.roundRect(30, 30, 660, 110, [32, 32, 0, 0]);
  x.fill();
  const texto = (t: string, px: number, y: number, color = "#464646", peso = 700, alinear: CanvasTextAlign = "left", xx = 70) => {
    x.font = `${peso} ${px}px system-ui, sans-serif`;
    x.fillStyle = color;
    x.textAlign = alinear;
    x.fillText(t, xx, y, 580);
  };
  texto("Andén", 36, 100, "#fff", 800);
  texto(`${b.tren.tipo} ${b.tren.numero}`, 26, 100, "#fff", 600, "right", 650);
  texto(b.tren.origen.ciudad, 48, 220, "#464646", 800);
  texto(hora(b.tren.salida), 34, 265, "#D62D61");
  texto(b.tren.destino.ciudad, 48, 350, "#464646", 800, "right", 650);
  texto(hora(b.tren.llegada), 34, 395, "#D62D61", 700, "right", 650);
  texto(fecha(b.tren.salida), 26, 460, "#464646", 600);
  texto(`Coche ${b.asiento.coche} · Asiento ${b.asiento.fila}${b.asiento.letra} · ${b.asiento.clase}`, 26, 505, "#464646", 600);
  texto(`${b.pasajero.nombre} ${b.pasajero.apellidos}`, 28, 550);
  const qr = document.createElement("canvas");
  await QRCode.toCanvas(qr, b.qr, { width: 360, margin: 1, errorCorrectionLevel: "M" });
  x.drawImage(qr, 180, 590, 360, 360);
  texto("Localizador", 22, 990, "#6b6b6b", 600, "center", 360);
  texto(b.localizador, 40, 1030, "#81005E", 800, "center", 360);
  return c;
}
