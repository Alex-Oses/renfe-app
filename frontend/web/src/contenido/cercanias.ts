import type { Pagina } from "./tipos";
import { nucleosCercanias } from "./navegacion";
// Cada núcleo vive en ./cercanias/<id>.ts (generado desde renfe.com con tools/gen.py del agente; prosa propia).
import { paginas as asturias } from "./cercanias/asturias";
import { paginas as bilbao } from "./cercanias/bilbao";
import { paginas as cadiz } from "./cercanias/cadiz";
import { paginas as cantabria } from "./cercanias/cantabria";
import { paginas as cartagena } from "./cercanias/cartagena";
import { paginas as ferrol } from "./cercanias/ferrol";
import { paginas as leon } from "./cercanias/leon";
import { paginas as madrid } from "./cercanias/madrid";
import { paginas as malaga } from "./cercanias/malaga";
import { paginas as murciaAlicante } from "./cercanias/murcia-alicante";
import { paginas as rodalies } from "./cercanias/rodalies-catalunya";
import { paginas as sanSebastian } from "./cercanias/san-sebastian";
import { paginas as sevilla } from "./cercanias/sevilla";
import { paginas as valencia } from "./cercanias/valencia";
import { paginas as zaragoza } from "./cercanias/zaragoza";

const nucleos = [
  asturias, bilbao, cadiz, cantabria, cartagena, ferrol, leon, madrid,
  malaga, murciaAlicante, rodalies, sanSebastian, sevilla, valencia, zaragoza,
].flat();

const portada: Pagina = {
  ruta: "/cercanias",
  titulo: "Cercanías",
  resumen: "Trenes de proximidad en 15 núcleos de España: líneas, estaciones, horarios, tarifas y avisos.",
  seccion: "cercanias",
  bloques: [
    {
      tipo: "texto",
      parrafos: [
        "Cercanías es el servicio de Renfe para moverte a diario dentro de las grandes áreas urbanas. Elige tu núcleo para ver sus líneas, el plano, los precios por zonas y los abonos.",
      ],
    },
    {
      tipo: "tarjetas",
      titulo: "Núcleos de Cercanías",
      tarjetas: nucleosCercanias.map((n) => ({
        titulo: n.texto,
        texto: nucleos.find((p) => p.ruta === n.ruta)?.resumen ?? "",
        enlace: n.ruta,
      })),
    },
    {
      tipo: "lista",
      titulo: "Ventajas comunes a todos los núcleos",
      items: [
        "Pago con tarjeta bancaria sin contacto o móvil en los tornos, con un 40 % de descuento desde el quinto viaje del mes.",
        "Abonos gratuitos o bonificados para viajeros frecuentes y el Abono Único de Cercanías y Media Distancia.",
        "Bicicletas y mascotas viajan gratis, con algunas condiciones.",
      ],
    },
    { tipo: "cta", texto: "¿Vas a salir ya?", enlace: "/gestiona/tus-reservas/estado-de-tu-tren", etiqueta: "Mira el estado de tu tren" },
  ],
};

export const paginas: Pagina[] = [portada, ...nucleos];
