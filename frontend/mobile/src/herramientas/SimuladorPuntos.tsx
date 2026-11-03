// Simulador del programa de puntos: 10 puntos por euro × multiplicador de nivel.
// Mismo cálculo que la web (componentes/herramientas/SimuladorPuntos.tsx).
import { useState } from "react";
import { Text, View } from "react-native";
import { euros } from "@renfe/shared/formato/formato";
import { estilos } from "@/tema";
import { CampoHerr, Herramienta, Selector } from "./comun";
import { NIVELES, puntosGanados, type Nivel } from "./logica";

export default function SimuladorPuntos() {
  const [importe, setImporte] = useState("100");
  const [nivel, setNivel] = useState<Nivel>("General");
  const n = Number(importe.replace(",", "."));
  const valido = Number.isFinite(n) && n >= 0;
  const r = puntosGanados(valido ? n : 0, nivel);

  return (
    <Herramienta titulo="Simula tus puntos">
      <View style={{ gap: 12 }}>
        <CampoHerr
          etiqueta="Importe gastado (€)"
          value={importe}
          onChangeText={setImporte}
          keyboardType="decimal-pad"
          placeholder="100"
          error={valido ? undefined : "Escribe un importe válido."}
        />
        <Selector
          etiqueta="Nivel"
          valor={nivel}
          opciones={Object.keys(NIVELES).map((k) => ({ valor: k, texto: k }))}
          onElegir={(v) => setNivel(v as Nivel)}
        />
      </View>
      <Text style={estilos.texto}>
        Ganarías <Text style={estilos.subtitulo}>{r.puntos.toLocaleString("es-ES")} puntos</Text>, equivalentes a{" "}
        <Text style={estilos.subtitulo}>{euros(r.euros)}</Text> en descuentos.
      </Text>
      <Text style={estilos.suave}>Cálculo simulado: 10 puntos por euro × multiplicador de nivel; 100 puntos = 1 €.</Text>
    </Herramienta>
  );
}
