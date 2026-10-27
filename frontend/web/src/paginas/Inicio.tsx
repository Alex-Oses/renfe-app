import { useEffect } from "react";
import { Link } from "react-router-dom";
import { nucleosCercanias } from "../contenido/navegacion";
import { EntradaTren } from "./inicio/EntradaTren";
import "./inicio/inicio.css";

const DESTINOS = [
  { origen: "60000", destino: "71801", de: "Madrid", a: "Barcelona", duracion: "2 h 30 min", desde: 19 },
  { origen: "60000", destino: "51003", de: "Madrid", a: "Sevilla", duracion: "2 h 35 min", desde: 19 },
  { origen: "60000", destino: "65000", de: "Madrid", a: "València", duracion: "1 h 50 min", desde: 19 },
  { origen: "60000", destino: "54413", de: "Madrid", a: "Málaga", duracion: "2 h 40 min", desde: 25 },
  { origen: "71801", destino: "04040", de: "Barcelona", a: "Zaragoza", duracion: "1 h 25 min", desde: 19 },
  { origen: "17000", destino: "37606", de: "Madrid", a: "León", duracion: "2 h 10 min", desde: 32 },
];

const icono = (d: string) => (
  <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const VENTAJAS = [
  { t: "Billete en el móvil", d: "Cada billete lleva un código QR que se lee en el control de acceso. Sin imprimir nada.", i: "M7 2h10v20H7zM10 6h4v4h-4zM10 14h1M13 14h1M10 17h4", a: { to: "/billetes", txt: "Ver mis billetes" } },
  { t: "Acceso con tu cara", d: "Si lo activas en tu cuenta, pasas el control mirando a la cámara. Lo puedes desactivar cuando quieras.", i: "M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3M9 10h.01M15 10h.01M9 15c1.6 1.3 4.4 1.3 6 0", a: { to: "/cuenta", txt: "Ir a mi cuenta" } },
  { t: "Sigue tu tren en directo", d: "Mira en el mapa por dónde va tu tren y si lleva retraso antes de salir hacia la estación.", i: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z", a: { to: "/mapa", txt: "Abrir el mapa" } },
  { t: "Cambios y anulaciones", d: "Cambia la fecha o anula el viaje desde el propio billete. Las condiciones dependen de la tarifa.", i: "M4 9h13l-3-3M20 15H7l3 3", a: { to: "/billetes", txt: "Gestionar un billete" } },
];

const AVISOS = [
  { t: "Revisa tu tren antes de salir", d: "Retrasos, cambios de andén y obras aparecen en el estado de cada tren.", a: "/gestiona/tus-reservas/estado-de-tu-tren" },
  { t: "Viajar con equipaje grande", d: "Qué cabe en el portaequipajes y cuándo hay que reservar espacio.", a: "/viajar/informacion-util/equipajes" },
  { t: "Asistencia en estaciones", d: "Pide ayuda para subir y bajar del tren con al menos 12 horas de antelación.", a: "/viajar/informacion-util/servicio-de-asistencia" },
];

const PROMOS = [
  { e: "Escapadas", t: "Tren y hotel en una sola reserva", d: "Paquetes de fin de semana a ciudades con estación céntrica.", a: "/viajar/prepara-tu-viaje/viajes-paquetes" },
  { e: "8 % menos", t: "Grupos de 4 a 9 personas", d: "Comprad juntos en el mismo trayecto y el descuento se aplica solo.", a: "/viajar/prepara-tu-viaje/descuentos" },
  { e: "5 €", t: "Menores de 14 años", d: "Billete a precio fijo viajando con un adulto en trenes seleccionados.", a: "/viajar/prepara-tu-viaje/descuentos" },
  { e: "Mascotas", t: "Tu perro o gato también viaja", d: "Condiciones de tamaño, transportín y plazas disponibles por tren.", a: "/viajar/informacion-util/mascotas" },
  { e: "10 a 25", t: "Grupos grandes", d: "Pide presupuesto para excursiones, equipos o viajes de empresa.", a: "/gestiona/tus-reservas/grupos-10-25" },
  { e: "Puntos", t: "Tarjeta de puntos", d: "Suma puntos con cada viaje y cámbialos por billetes.", a: "/mas-renfe" },
];

const RUTAS = [
  { t: "Norte verde", d: "Bilbao, Santander y Oviedo entre montaña y costa.", a: "/inspirate/rutas/norte-verde" },
  { t: "Mediterráneo", d: "De Barcelona a Alicante pegados al mar.", a: "/inspirate/rutas/mediterraneo" },
  { t: "Andalucía en tren", d: "Sevilla, Córdoba, Granada y Málaga sin coche.", a: "/inspirate/rutas/andalucia" },
  { t: "Ciudades Patrimonio", d: "Toledo, Segovia, Salamanca y Ávila en escapadas cortas.", a: "/inspirate/rutas/ciudades-patrimonio" },
];

const GESTIONA = [
  { t: "Cambia tu billete", a: "/gestiona/tus-reservas/cambia-tu-billete" },
  { t: "Anula tu billete", a: "/gestiona/tus-reservas/anula-tu-billete" },
  { t: "Consulta tus viajes", a: "/gestiona/tus-reservas/consulta-tus-viajes" },
  { t: "Pide tu factura", a: "/gestiona/posventa/factura" },
];

const PREGUNTAS = [
  { p: "¿Con cuánta antelación tengo que llegar a la estación?", r: "En alta velocidad hay control de equipaje y de acceso: cuenta con llegar unos 20 minutos antes. El acceso se cierra 2 minutos antes de la salida." },
  { p: "¿Necesito imprimir el billete?", r: "No. Basta con enseñar el código QR desde el móvil, que también funciona sin conexión una vez descargado." },
  { p: "¿Cuánto equipaje puedo llevar?", r: "Por norma general, una maleta grande, una de mano y un bulto pequeño por persona. Las tarifas básicas pueden limitarlo." },
  { p: "¿Qué pasa si el tren llega con retraso?", r: "Según el retraso y el tipo de tren puedes tener derecho a una devolución parcial o total. La solicitas desde el billete." },
  { p: "¿Cómo funciona el acceso con mi cara?", r: "Guardamos una plantilla de tu rostro, no la foto, solo si das tu permiso. Puedes borrarla desde tu cuenta y seguir usando el QR." },
];

export function Inicio() {
  const manana = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

  // Una sola entrada sutil por sección al aparecer en pantalla.
  useEffect(() => {
    const secciones = document.querySelectorAll(".revela");
    const io = new IntersectionObserver(
      (entradas) =>
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revela--visible");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -10% 0px" },
    );
    secciones.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <div className="inicio">
      <EntradaTren />

      <section className="contenedor seccion revela" aria-labelledby="avisos-titulo">
        <h2 id="avisos-titulo">Antes de viajar</h2>
        <ul className="modulo-avisos">
          {AVISOS.map((v) => (
            <li key={v.t}>
              <Link className="modulo-aviso cristal cristal--pulsable" to={v.a}>
                <strong>{v.t}</strong>
                <span>{v.d}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="contenedor seccion revela" aria-labelledby="promos-titulo">
        <h2 id="promos-titulo">Ofertas para viajar más por menos</h2>
        <ul className="promos">
          {PROMOS.map((p) => (
            <li key={p.t}>
              <Link className="promo cristal cristal--pulsable" to={p.a}>
                <span className="promo__dato">{p.e}</span>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="contenedor seccion revela" aria-labelledby="rutas-titulo">
        <h2 id="rutas-titulo">Rutas para descubrir en tren</h2>
        <ul className="rutas">
          {RUTAS.map((r, i) => (
            <li key={r.a}>
              <Link className={`ruta ruta--${i}`} to={r.a}>
                <h3>{r.t}</h3>
                <p>{r.d}</p>
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/inspirate/rutas">Ver todas las rutas</Link>
      </section>

      <section className="contenedor seccion revela" aria-labelledby="atajos-titulo">
        <h2 id="atajos-titulo">Accesos rápidos</h2>
        <div className="atajos">
          <div className="atajo cristal">
            <h3>Gestiona tu billete</h3>
            <ul>
              {GESTIONA.map((g) => (
                <li key={g.a}>
                  <Link to={g.a}>{g.t}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="atajo atajo--ancho cristal">
            <h3>Cercanías por núcleo</h3>
            <ul className="atajo__chips">
              {nucleosCercanias.map((n) => (
                <li key={n.ruta}>
                  <Link className="atajo__chip" to={n.ruta}>
                    {n.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Link className="atajo cristal cristal--oscuro cristal--pulsable" to="/mas-renfe">
            <h3>Programa de puntos</h3>
            <p>Acumula con cada viaje y canjéalos por billetes y ventajas.</p>
          </Link>
          <Link className="atajo cristal cristal--pulsable" to="/viajar/informacion-util/aplicaciones">
            <h3>Lleva el viaje en el móvil</h3>
            <p>Billetes, avisos y cambios de última hora en la app.</p>
          </Link>
        </div>
      </section>

      <section className="contenedor seccion revela" aria-labelledby="destinos-titulo">
        <h2 id="destinos-titulo">Destinos destacados</h2>
        <p className="inicio__intro">Precios para viajar mañana, por persona y trayecto, en la tarifa más barata disponible.</p>
        <ul className="destinos">
          {DESTINOS.map((d) => (
            <li key={d.origen + d.destino}>
              <Link className="destino" to={`/trenes?${new URLSearchParams({ origen: d.origen, destino: d.destino, fecha: manana })}`}>
                <span className="destino__ruta">
                  {d.de} <span aria-hidden="true">→</span>
                  <span className="sr"> a </span> {d.a}
                </span>
                <span className="destino__dato">{d.duracion} de viaje</span>
                <span className="destino__precio">
                  desde <strong>{d.desde} €</strong>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="contenedor seccion revela" aria-labelledby="ventajas-titulo">
        <h2 id="ventajas-titulo">Todo el viaje desde el móvil</h2>
        <ul className="ventajas">
          {VENTAJAS.map((v) => (
            <li key={v.t} className="ventaja">
              <span className="ventaja__icono">{icono(v.i)}</span>
              <h3>{v.t}</h3>
              <p>{v.d}</p>
              <Link to={v.a.to}>{v.a.txt}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="directo revela" aria-labelledby="directo-titulo">
        <div className="contenedor directo__interior">
          <div>
            <h2 id="directo-titulo">Sigue tu tren en directo</h2>
            <p>Posición en el mapa, próxima parada y minutos de retraso, actualizados cada pocos segundos.</p>
          </div>
          <Link className="directo__boton" to="/mapa">
            Ver el mapa de trenes
          </Link>
        </div>
      </section>

      <section className="contenedor seccion revela" aria-labelledby="faq-titulo">
        <h2 id="faq-titulo">Preguntas frecuentes</h2>
        <div className="faq">
          {PREGUNTAS.map((q) => (
            <details key={q.p}>
              <summary>{q.p}</summary>
              <p>{q.r}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
