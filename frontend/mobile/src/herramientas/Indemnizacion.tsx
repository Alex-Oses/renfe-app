// Indemnización por retraso: mismo cálculo y mismos textos que la web (FormIndemnizacion.tsx).
import { useState } from "react";
import { Text, View } from "react-native";
import { indemnizacion, porcentajeIndemnizacion } from "@renfe/shared/billetes/indemnizacion";
import type { Reserva } from "@renfe/shared/api/tipos";
import { euros } from "@renfe/shared/formato/formato";
import { Aviso } from "@/components/Aviso";
import { Boton } from "@/components/Boton";
import { estilos } from "@/tema";
import { BuscaReserva, CampoHerr, Exito, Herramienta, ResumenReserva, useEnvio } from "./comun";

export default function FormIndemnizacion() {
  const [r, setR] = useState<Reserva | null>(null);
  const [min, setMin] = useState("");
  const [error, setError] = useState("");
  const [calc, setCalc] = useState<{ pct: number; importe: number } | null>(null);
  const envio = useEnvio("IND");

  function calcular() {
    const m = Number(min);
    if (!Number.isInteger(m) || m < 0 || m > 1440) return setError("Escribe los minutos de retraso (0 a 1440).");
    setError("");
    if (r) setCalc({ pct: porcentajeIndemnizacion(r.tren.tipo, m), importe: indemnizacion(r.tren.tipo, m, r.total) });
  }

  return (
    <Herramienta titulo="Solicita tu indemnización por retraso">
      <BuscaReserva
        filtro={(x) => (x.estado === "pagada" ? null : "Solo se indemnizan reservas pagadas.")}
        onReserva={(x) => {
          setR(x);
          setCalc(null);
          envio.reiniciar();
        }}
      />
      {r ? (
        <View style={{ gap: 10 }}>
          <ResumenReserva r={r} />
          <CampoHerr
            etiqueta="Minutos de retraso en destino"
            value={min}
            onChangeText={setMin}
            keyboardType="number-pad"
            placeholder="0"
            error={error}
          />
          <Boton texto="Calcular" variante="secundario" onPress={calcular} />
          {calc ? (
            calc.pct === 0 ? (
              <Aviso tipo="info" texto={`Con ese retraso, un ${r.tren.tipo} no tiene indemnización según el compromiso de puntualidad.`} />
            ) : envio.exp ? (
              <Exito>
                Solicitud enviada. Expediente {envio.exp}. Recibirás {euros(calc.importe)} (simulado).
              </Exito>
            ) : (
              <>
                <Text style={estilos.texto}>
                  Te corresponde el <Text style={estilos.subtitulo}>{calc.pct} %</Text>:{" "}
                  <Text style={estilos.subtitulo}>{euros(calc.importe)}</Text>.
                </Text>
                <Boton
                  texto={envio.enviando ? "Enviando…" : "Solicitar indemnización"}
                  onPress={() => void envio.enviar()}
                  cargando={envio.enviando}
                  desactivado={envio.enviando}
                />
              </>
            )
          ) : null}
        </View>
      ) : null}
    </Herramienta>
  );
}
