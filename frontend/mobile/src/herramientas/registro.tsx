// id del bloque { tipo: "herramienta" } del contenido compartido -> widget de la app.
// Mismo registro que la web (componentes/herramientas/registro.tsx).
import type { ComponentType } from "react";
import { AnadeExtras, AnadeNino } from "./Anadidos";
import BuscadorFaqs from "./BuscadorFaqs";
import { CercaniasHorarios, BuscadorHorarios } from "./Horarios";
import { EstadoTren, MapaLineas } from "./EstadoTren";
import FormIndemnizacion from "./Indemnizacion";
import {
  AltaAvisos,
  FormCitaPrevia,
  FormContacto,
  FormFactura,
  FormObjetosPerdidos,
  FormReclamacion,
  SolicitudGrupos,
} from "./Formularios";
import { AnulaBillete, CambiaBillete, CompraLocalizador, ConsultaReserva } from "./Reservas";
import SimuladorPuntos from "./SimuladorPuntos";

/** `ruta` es la página de contenido que pinta el widget (la usa el buscador de FAQ). */
export type PropsHerramienta = { ruta?: string };

export const herramientas: Record<string, ComponentType<PropsHerramienta>> = {
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
