import "@/polyfills"; // antes que @renfe/shared: usa localStorage y crypto
import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
  useFonts,
} from "@expo-google-fonts/instrument-sans";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { configurarApi, vigilarApi } from "@renfe/shared/api/cliente";
import { AvisoRespaldo } from "@/AvisoRespaldo";
import { restaurarSesion } from "@/sesion";
import { colores, fuentes } from "@/tema";
import { Vigilante } from "@/Vigilante";

export { ErrorBoundary } from "expo-router";

// Sin EXPO_PUBLIC_API_URL, datos simulados; el mapa tira de la API de Render por defecto.
configurarApi({
  api: process.env.EXPO_PUBLIC_API_URL,
  respaldo: process.env.EXPO_PUBLIC_API_RESPALDO_URL,
  posiciones: process.env.EXPO_PUBLIC_POSICIONES_URL || "https://renfe-api.onrender.com",
});
vigilarApi();

restaurarSesion();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [cargadas, error] = useFonts({
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
    InstrumentSans_700Bold,
  });
  useEffect(() => {
    if (cargadas || error) SplashScreen.hideAsync();
  }, [cargadas, error]);
  if (!cargadas && !error) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Vigilante />
      <AvisoRespaldo />
      <Stack
        screenOptions={{
          headerTintColor: colores.marca,
          headerTitleStyle: { fontFamily: fuentes.seminegrita, color: colores.titulo },
          contentStyle: { backgroundColor: colores.fondo },
          headerBackTitle: "Atrás",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="resultados" options={{ headerShown: false }} />
        <Stack.Screen name="pasajero" options={{ headerShown: false }} />
        <Stack.Screen name="billete/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="abonos" options={{ headerShown: false }} />
        <Stack.Screen name="comprar-abono" options={{ headerShown: false }} />
        <Stack.Screen name="abono/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="revisor" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
