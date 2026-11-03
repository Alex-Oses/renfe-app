// Añadir niño o servicios extra a una reserva existente (precios simulados).
// Mismo comportamiento que la web (componentes/herramientas/Anadidos.tsx).
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { Reserva } from "@renfe/shared/api/tipos";
import { euros } from "@renfe/shared/formato/formato";
import { Boton } from "@/components/Boton";
import { Icono } from "@/components/Icono";
import { colores, espaciado, estilos, fuentes } from "@/tema";
import { BuscaReserva, Exito, Herramienta, ResumenReserva, useEnvio } from "./comun";

type Opcion = { id: string; texto: string; precio: number };

function Anadir({ titulo, opciones, prefijo }: { titulo: string; opciones: Opcion[]; prefijo: string }) {
  const [r, setR] = useState<Reserva | null>(null);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const envio = useEnvio(prefijo);
  const total = opciones.filter((o) => sel.has(o.id)).reduce((s, o) => s + o.precio, 0);
  const alternar = (id: string) =>
    setSel((s) => {
      const n = new Set(s);
      if (!n.delete(id)) n.add(id);
      return n;
    });

  return (
    <Herramienta titulo={titulo}>
      <BuscaReserva
        filtro={(x) => (x.estado === "cancelada" ? "Esa reserva está anulada." : null)}
        onReserva={(x) => {
          setR(x);
          setSel(new Set());
          envio.reiniciar();
        }}
      />
      {r ? (
        <View style={{ gap: espaciado[3] }}>
          <ResumenReserva r={r} />
          {envio.exp ? (
            <Exito>
              Añadido a tu reserva. Expediente {envio.exp}. Total: {euros(total)} (simulado).
            </Exito>
          ) : (
            <>
              <Text style={estilos.textoMedio}>Elige qué añadir</Text>
              <View style={{ gap: 6 }}>
                {opciones.map((o) => {
                  const activa = sel.has(o.id);
                  return (
                    <Pressable
                      key={o.id}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: activa }}
                      onPress={() => alternar(o.id)}
                      style={({ pressed }) => ({
                        flexDirection: "row",
                        alignItems: "center",
                        gap: espaciado[2],
                        minHeight: 46,
                        paddingHorizontal: espaciado[3],
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: activa ? "rgba(129,0,94,0.35)" : "rgba(255,255,255,0.9)",
                        backgroundColor: activa ? "rgba(251,227,236,0.9)" : pressed ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.72)",
                      })}
                    >
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          borderWidth: 1.6,
                          borderColor: activa ? colores.marca : colores.borde,
                          backgroundColor: activa ? colores.marca : "transparent",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {activa ? <Icono nombre="check" tamano={15} color="#fff" grosor={2.4} /> : null}
                      </View>
                      <Text style={[estilos.texto, { flex: 1 }]}>{o.texto}</Text>
                      <Text style={{ fontFamily: fuentes.negrita, fontSize: 13.5, color: colores.marca }}>{euros(o.precio)}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={estilos.texto}>
                Total: <Text style={estilos.subtitulo}>{euros(total)}</Text>
              </Text>
              <Boton
                texto={envio.enviando ? "Añadiendo…" : "Añadir"}
                onPress={() => void envio.enviar()}
                cargando={envio.enviando}
                desactivado={!sel.size || envio.enviando}
              />
            </>
          )}
        </View>
      ) : null}
    </Herramienta>
  );
}

export const AnadeNino = () => (
  <Anadir
    titulo="Añade un niño a tu viaje"
    prefijo="NIN"
    opciones={[
      { id: "menor4", texto: "Niño menor de 4 años sin asiento", precio: 0 },
      { id: "nino", texto: "Niño de 4 a 13 años con asiento (40 % dto.)", precio: 18 },
    ]}
  />
);

export const AnadeExtras = () => (
  <Anadir
    titulo="Añade servicios a tu billete"
    prefijo="EXT"
    opciones={[
      { id: "mascota", texto: "Mascota (hasta 10 kg)", precio: 25 },
      { id: "bici", texto: "Bicicleta", precio: 10 },
      { id: "equipaje", texto: "Equipaje extra", precio: 15 },
      { id: "parking", texto: "Parking en estación (24 h)", precio: 12 },
    ]}
  />
);
