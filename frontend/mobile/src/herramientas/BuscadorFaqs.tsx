// Buscador dentro de las preguntas frecuentes de la propia página, como en la web.
import { useState } from "react";
import { Text, View } from "react-native";
import { buscarPagina } from "@renfe/shared/contenido";
import { sinTildes } from "@renfe/shared/formato/texto";
import { colores, espaciado, estilos, fuentes, tonos } from "@/tema";
import { CampoHerr, Herramienta } from "./comun";

// Resalta sin tildes: la normalización NFD + quitar marcas mantiene una letra por letra en español.
function Resaltar({ texto, q }: { texto: string; q: string }) {
  if (!q) return <Text style={estilos.texto}>{texto}</Text>;
  const base = sinTildes(texto);
  const partes: { texto: string; marca: boolean }[] = [];
  let i = 0;
  for (let j = base.indexOf(q); j !== -1; j = base.indexOf(q, i)) {
    if (j > i) partes.push({ texto: texto.slice(i, j), marca: false });
    partes.push({ texto: texto.slice(j, j + q.length), marca: true });
    i = j + q.length;
  }
  if (i < texto.length) partes.push({ texto: texto.slice(i), marca: false });
  return (
    <Text style={estilos.texto}>
      {partes.map((p, k) =>
        p.marca ? (
          <Text key={k} style={{ backgroundColor: "#ffe9a8", fontFamily: fuentes.seminegrita }}>
            {p.texto}
          </Text>
        ) : (
          p.texto
        ),
      )}
    </Text>
  );
}

export default function BuscadorFaqs({ ruta = "" }: { ruta?: string }) {
  const [q, setQ] = useState("");
  const [abierta, setAbierta] = useState<string | null>(null);
  const preguntas = (buscarPagina(ruta)?.bloques ?? []).flatMap((b) => (b.tipo === "faq" ? b.preguntas : []));
  const t = sinTildes(q.trim());
  const visibles = t ? preguntas.filter((x) => sinTildes(`${x.p} ${x.r}`).includes(t)) : preguntas;

  return (
    <Herramienta titulo="Busca en las preguntas frecuentes">
      <CampoHerr etiqueta="¿Qué necesitas saber?" value={q} onChangeText={setQ} placeholder="retraso, equipaje, QR…" />
      <Text style={estilos.suave}>{t ? `${visibles.length} de ${preguntas.length} preguntas` : `${preguntas.length} preguntas`}</Text>
      {visibles.map((x) => {
        const abierto = !!t || abierta === x.p;
        return (
          <View key={x.p} style={{ gap: 4 }}>
            <Text
              accessibilityRole="button"
              accessibilityState={{ expanded: abierto }}
              onPress={() => setAbierta(abierto && !t ? null : x.p)}
              style={{ fontFamily: fuentes.seminegrita, fontSize: 14.4, color: colores.titulo }}
            >
              {x.p}
            </Text>
            {abierto ? (
              <View style={{ backgroundColor: tonos.rosa, borderRadius: 10, padding: espaciado[3] }}>
                <Resaltar texto={x.r} q={t} />
              </View>
            ) : null}
          </View>
        );
      })}
    </Herramienta>
  );
}
