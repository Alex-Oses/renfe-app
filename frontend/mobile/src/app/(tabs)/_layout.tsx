import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { StyleSheet } from "react-native";
import { colores, cristal, fuentes, tipografia } from "@/tema";

type Icono = SymbolViewProps["name"];
const pestanas: { name: string; title: string; icono: Icono }[] = [
  { name: "index", title: "Comprar", icono: { ios: "magnifyingglass", android: "search", web: "search" } },
  { name: "directo", title: "En directo", icono: { ios: "map", android: "map", web: "map" } },
  { name: "billetes", title: "Billetes", icono: { ios: "ticket", android: "confirmation_number", web: "confirmation_number" } },
  { name: "lineas", title: "Líneas", icono: { ios: "tram", android: "train", web: "train" } },
  { name: "cuenta", title: "Cuenta", icono: { ios: "person.crop.circle", android: "account_circle", web: "account_circle" } },
];

// Barra inferior de cristal como la de la web en móvil (--cristal-liquido).
export default function LayoutPestanas() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colores.marca,
        tabBarInactiveTintColor: colores.textoSuave,
        tabBarLabelStyle: { fontFamily: fuentes.medio, fontSize: tipografia.tamanos.xs },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopColor: cristal.brillo,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={cristal.liquido.desenfoque * 3}
            tint="light"
            style={[StyleSheet.absoluteFill, { backgroundColor: cristal.liquido.fondo }]}
          />
        ),
        headerTitleStyle: { fontFamily: fuentes.seminegrita, color: colores.titulo },
        headerStyle: { backgroundColor: colores.fondo },
        headerShadowVisible: false,
      }}
    >
      {pestanas.map((p) => (
        <Tabs.Screen
          key={p.name}
          name={p.name}
          options={{
            title: p.title,
            tabBarIcon: ({ color }) => <SymbolView name={p.icono} tintColor={color} size={24} />,
          }}
        />
      ))}
    </Tabs>
  );
}
