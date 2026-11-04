// Widgets que parten de un localizador: consulta, cambio, anulación y pago pendiente.
// Mismas reglas que la web (componentes/herramientas/Reservas.tsx).
import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { cancelarReserva, confirmarPagoSimulado, usaDatosSimulados } from "@renfe/shared/api/cliente";
import type { Reserva } from "@renfe/shared/api/tipos";
import { euros } from "@renfe/shared/formato/formato";
import { Aviso } from "@/components/Aviso";
import { Boton } from "@/components/Boton";
import { estilos } from "@/tema";
import { BuscaReserva, Exito, Herramienta, ResumenReserva, useEnvio } from "./comun";
import { costeCambio, devolucionAnulacion, PENALIZACION, tarifaDe } from "./logica";

const soloPagadas = (r: Reserva) =>
  r.estado === "pagada" ? null : r.estado === "cancelada" ? "Esa reserva ya está anulada." : "Esa reserva aún no está pagada.";

export function ConsultaReserva() {
  const [r, setR] = useState<Reserva | null>(null);
  return (
    <Herramienta titulo="Consulta tu reserva">
      <BuscaReserva conEmail onReserva={setR} />
      {r ? (
        <View style={{ gap: 6 }}>
          <ResumenReserva r={r} />
          <Text style={estilos.texto}>
            Total: <Text style={estilos.subtitulo}>{euros(r.total)}</Text>
          </Text>
        </View>
      ) : null}
    </Herramienta>
  );
}

export function CambiaBillete() {
  const [r, setR] = useState<Reserva | null>(null);
  const envio = useEnvio("CAM");
  const tarifa = r && tarifaDe(r);
  const coste = r && tarifa ? costeCambio(tarifa, r.total) : null;
  return (
    <Herramienta titulo="Cambia tu billete">
      <BuscaReserva
        filtro={soloPagadas}
        onReserva={(x) => {
          setR(x);
          envio.reiniciar();
        }}
      />
      {r && tarifa ? (
        <View style={{ gap: 8 }}>
          <ResumenReserva r={r} />
          <Text style={estilos.texto}>
            Tarifa: <Text style={estilos.textoMedio}>{tarifa}</Text>
          </Text>
          {coste === null ? (
            <Aviso texto="La tarifa Básico no permite cambios." />
          ) : envio.exp ? (
            <>
              <Exito>
                Cambio solicitado. Expediente {envio.exp}. Elige el nuevo tren en el buscador.
              </Exito>
              <Boton texto="Ir al buscador" variante="secundario" icono="comprar" onPress={() => router.navigate("/")} />
            </>
          ) : (
            <>
              <Text style={estilos.texto}>
                Coste del cambio: <Text style={estilos.textoMedio}>{coste === 0 ? "gratis" : euros(coste)}</Text> (simulado).
              </Text>
              <Boton
                texto={envio.enviando ? "Procesando…" : "Confirmar cambio"}
                onPress={() => void envio.enviar()}
                cargando={envio.enviando}
                desactivado={envio.enviando}
              />
            </>
          )}
        </View>
      ) : null}
    </Herramienta>
  );
}

export function AnulaBillete() {
  const [r, setR] = useState<Reserva | null>(null);
  const envio = useEnvio("ANU");
  const tarifa = r && tarifaDe(r);
  const devuelve = r && tarifa ? devolucionAnulacion(tarifa, r.total) : null;
  const [reembolso, setReembolso] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function confirmar(res: Reserva) {
    setError("");
    try {
      if (!usaDatosSimulados) setReembolso((await cancelarReserva(res.localizador)).reembolso);
      await envio.enviar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo anular la reserva.");
    }
  }

  return (
    <Herramienta titulo="Anula tu billete">
      <BuscaReserva
        filtro={soloPagadas}
        onReserva={(x) => {
          setR(x);
          envio.reiniciar();
        }}
      />
      {r && tarifa ? (
        <View style={{ gap: 8 }}>
          <ResumenReserva r={r} />
          <Text style={estilos.texto}>
            Tarifa: <Text style={estilos.textoMedio}>{tarifa}</Text>
          </Text>
          {devuelve === null ? (
            <Aviso texto="La tarifa Básico no permite anulación." />
          ) : envio.exp ? (
            <Exito>
              Anulación registrada. Expediente {envio.exp}. Te devolveremos {euros(reembolso ?? devuelve)} (simulado).
            </Exito>
          ) : (
            <>
              <Text style={estilos.texto}>
                Penalización: {PENALIZACION[tarifa]} %. Te devolvemos{" "}
                <Text style={estilos.textoMedio}>{euros(devuelve)}</Text> de {euros(r.total)}.
              </Text>
              <Boton
                texto={envio.enviando ? "Procesando…" : "Confirmar anulación"}
                variante="peligro"
                onPress={() => void confirmar(r)}
                cargando={envio.enviando}
                desactivado={envio.enviando}
              />
              {error ? <Aviso texto={error} /> : null}
            </>
          )}
        </View>
      ) : null}
    </Herramienta>
  );
}

export function CompraLocalizador() {
  const [r, setR] = useState<Reserva | null>(null);
  const [pagando, setPagando] = useState(false);
  const [error, setError] = useState("");

  async function pagar(res: Reserva) {
    setPagando(true);
    setError("");
    try {
      setR(await confirmarPagoSimulado(res.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar el pago.");
    } finally {
      setPagando(false);
    }
  }

  return (
    <Herramienta titulo="Paga una reserva pendiente">
      <BuscaReserva filtro={(x) => (x.estado === "pendiente_pago" ? null : "Esa reserva no está pendiente de pago.")} onReserva={setR} />
      {r ? (
        <View style={{ gap: 8 }}>
          <ResumenReserva r={r} />
          <Text style={estilos.texto}>
            Total: <Text style={estilos.textoMedio}>{euros(r.total)}</Text>
          </Text>
          {r.estado === "pagada" ? (
            <>
              <Exito>Pago confirmado.</Exito>
              <Boton texto="Ver mis billetes" icono="billetes" onPress={() => router.navigate("/billetes")} />
            </>
          ) : (
            <>
              <Text style={estilos.suave}>Pago simulado: no se pide ninguna tarjeta.</Text>
              <Boton
                texto={pagando ? "Procesando el pago…" : "Ir al pago"}
                onPress={() => void pagar(r)}
                cargando={pagando}
                desactivado={pagando}
              />
            </>
          )}
          {error ? <Aviso texto={error} /> : null}
        </View>
      ) : null}
    </Herramienta>
  );
}
