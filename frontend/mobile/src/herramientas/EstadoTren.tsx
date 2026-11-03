// Estado de un tren por número o estación, y listado de corredores.
// Mismos datos que la web (EstadoTren.tsx y MapaLineas.tsx).
import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { posicionesTrenes } from "@renfe/shared/api/cliente";
import { posiciones } from "@renfe/shared/api/simulado-tiempo-real";
import type { PosicionTren } from "@renfe/shared/api/tipos";
import { sinTildes } from "@renfe/shared/formato/texto";
import { Aviso } from "@/components/Aviso";
import { Boton } from "@/components/Boton";
import { colores, estilos, fuentes } from "@/tema";
import { CampoHerr, Herramienta } from "./comun";

export function EstadoTren() {
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [res, setRes] = useState<PosicionTren[] | null>(null);

  async function enviar() {
    const t = sinTildes(q.trim());
    if (!t) return setError("Escribe un número de tren o una estación.");
    setError("");
    setCargando(true);
    try {
      const todos = await posicionesTrenes();
      setRes(todos.filter((p) => p.numero === t || sinTildes(`${p.origen} ${p.destino}`).includes(t)));
    } catch {
      setError("No hemos podido consultar el estado. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <Herramienta titulo="Estado de tu tren">
      <View style={{ gap: 12 }}>
        <CampoHerr
          etiqueta="Nº de tren, origen o destino"
          value={q}
          onChangeText={setQ}
          placeholder="3142 o Sevilla"
          ayuda="Ej.: 3142 o Sevilla"
          error={error}
        />
        <Boton texto={cargando ? "Consultando…" : "Consultar"} onPress={() => void enviar()} cargando={cargando} desactivado={cargando} />
      </View>
      {res ? (
        res.length === 0 ? (
          <Text style={estilos.suave}>No hay ningún tren circulando que coincida.</Text>
        ) : (
          <View style={{ gap: 8 }}>
            {res.slice(0, 8).map((p) => (
              <View key={p.trenId} style={{ gap: 4 }}>
                <Text style={estilos.textoMedio}>
                  {p.tipo} {p.numero}
                </Text>
                <Text style={estilos.texto}>
                  {p.origen} → {p.destino}.{" "}
                  {p.retrasoSeg === null
                    ? "Sin datos de retraso"
                    : p.retrasoSeg > 0
                      ? `Retraso de ${Math.round(p.retrasoSeg / 60)} min`
                      : "En hora"}
                  . Próxima parada: {p.proximaParada}.
                </Text>
                <Boton
                  texto="Ver en el mapa"
                  variante="texto"
                  onPress={() => router.navigate({ pathname: "/directo", params: { tren: p.trenId } } as never)}
                />
              </View>
            ))}
          </View>
        )
      ) : null}
    </Herramienta>
  );
}

// Corredores sacados de los recorridos simulados en tiempo real, sin repetir sentido.
function corredores() {
  const vistos = new Map<string, { tipo: string; paradas: string[] }>();
  for (const p of posiciones()) {
    const nombres = p.paradas.map((x) => x.nombre);
    const clave = `${p.tipo}|${[...nombres].sort().join("|")}`;
    if (!vistos.has(clave)) vistos.set(clave, { tipo: p.tipo, paradas: nombres });
  }
  return [...vistos.values()].sort((a, b) => a.tipo.localeCompare(b.tipo));
}

export function MapaLineas() {
  const lineas = corredores();
  return (
    <Herramienta titulo="Líneas y corredores">
      <View style={{ gap: 8 }}>
        {lineas.map((l) => (
          <View key={l.tipo + l.paradas.join()} style={{ gap: 2 }}>
            <Text style={{ fontFamily: fuentes.seminegrita, fontSize: 14, color: colores.titulo }}>{l.tipo}</Text>
            <Text style={estilos.suave}>{l.paradas.join(" – ")}</Text>
          </View>
        ))}
      </View>
      <Boton texto="Ver trenes en el mapa" variante="secundario" icono="mapa" onPress={() => router.navigate("/directo")} />
    </Herramienta>
  );
}
