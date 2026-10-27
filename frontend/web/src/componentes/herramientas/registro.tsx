import type { ComponentType } from "react";
// Import normal: PaginaContenido pinta el widget sin <Suspense> propio y con lazy toda la página parpadearía al cargarlo.
import BuscadorHorarios from "./BuscadorHorarios";
import MapaLineas from "./MapaLineas";
import CercaniasHorarios from "./CercaniasHorarios";
import EstadoTren from "./EstadoTren";
import FormIndemnizacion from "./FormIndemnizacion";
import SimuladorPuntos from "./SimuladorPuntos";
import BuscadorFaqs from "./BuscadorFaqs";
import { AnulaBillete, CambiaBillete, CompraLocalizador, ConsultaReserva } from "./Reservas";
import { AnadeExtras, AnadeNino } from "./Anadidos";
import { AltaAvisos, FormCitaPrevia, FormContacto, FormFactura, FormObjetosPerdidos, FormReclamacion, SolicitudGrupos } from "./Formularios";

// id del bloque { tipo: "herramienta" } -> componente interactivo
export const herramientas: Record<string, ComponentType> = {
  "buscador-horarios": BuscadorHorarios,
  "mapa-lineas": MapaLineas,
  "cercanias-horarios": CercaniasHorarios,
  "estado-tren": EstadoTren,
  "consulta-reserva": ConsultaReserva,
  "cambia-billete": CambiaBillete,
  "anula-billete": AnulaBillete,
  "compra-localizador": CompraLocalizador,
  "solicitud-grupos": SolicitudGrupos,
  "form-indemnizacion": FormIndemnizacion,
  "form-factura": FormFactura,
  "form-reclamacion": FormReclamacion,
  "form-objetos-perdidos": FormObjetosPerdidos,
  "form-cita-previa": FormCitaPrevia,
  "form-contacto": FormContacto,
  "anade-nino": AnadeNino,
  "anade-extras": AnadeExtras,
  "alta-avisos": AltaAvisos,
  "simulador-puntos": SimuladorPuntos,
  "buscador-faqs": BuscadorFaqs,
};
