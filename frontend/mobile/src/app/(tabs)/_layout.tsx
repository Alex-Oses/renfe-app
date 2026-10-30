import { Tabs } from "expo-router";
import { BarraPestanas } from "@/components/BarraPestanas";

// Barra flotante de cristal propia (la web en móvil no usa la barra nativa).
export default function LayoutPestanas() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BarraPestanas {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Comprar" }} />
      <Tabs.Screen name="directo" options={{ title: "En directo" }} />
      <Tabs.Screen name="billetes" options={{ title: "Billetes" }} />
      <Tabs.Screen name="lineas" options={{ title: "Líneas" }} />
      <Tabs.Screen name="cuenta" options={{ title: "Cuenta" }} />
    </Tabs>
  );
}
