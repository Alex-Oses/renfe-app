// Página «App»: descarga del APK para Android y qué hacer en iPhone.
// El APK sale de EAS (perfil preview) y se sube como asset «renfe.apk» de un release de GitHub;
// /releases/latest/download/ siempre apunta al último, así el enlace no cambia entre versiones.
import { Link } from "react-router-dom";
import "./contenido.css";

export const URL_APK = "https://github.com/Alex-Oses/renfe-app/releases/latest/download/renfe.apk";

export default function DescargarApp() {
  return (
    <div className="contenedor seccion app-descarga">
      <h1>Lleva tu viaje en el móvil</h1>
      <p>
        Compra billetes, enséñalos con el QR, sigue tu tren en directo y paga mirando a la cámara: cada pago se confirma con
        tu cara.
      </p>

      <div className="app-descarga__rejilla">
        <section className="tarjeta cristal" aria-labelledby="app-android">
          <h2 id="app-android">Android</h2>
          <p>Descarga el APK e instálalo. Android te pedirá permitir apps de esta fuente la primera vez.</p>
          <a className="boton" href={URL_APK} download>
            Descargar para Android (APK)
          </a>
          <ol className="app-descarga__pasos">
            <li>Abre el archivo descargado.</li>
            <li>Si sale el aviso, permite instalar desde el navegador.</li>
            <li>Abre Renfe, crea tu cuenta y registra tu cara.</li>
          </ol>
        </section>

        <section className="tarjeta cristal" aria-labelledby="app-ios">
          <h2 id="app-ios">iPhone y iPad</h2>
          <p>
            iOS no permite instalar archivos APK y la app aún no está en el App Store. Mientras tanto, usa la web como si
            fuera una app:
          </p>
          <ol className="app-descarga__pasos">
            <li>Abre esta web en Safari.</li>
            <li>
              Pulsa <strong>Compartir</strong> y luego <strong>Añadir a pantalla de inicio</strong>.
            </li>
          </ol>
          <Link className="boton boton--secundario" to="/">
            Comprar desde la web
          </Link>
        </section>
      </div>

      <p className="app-descarga__nota">
        Proyecto de clase: el APK está firmado para pruebas y no viene de Google Play. Precios y pagos son simulados.
      </p>
    </div>
  );
}
