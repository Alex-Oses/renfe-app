import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { Boton } from "@/components/Boton";
import { estilos } from "@/tema";

// Placeholder: "Mis líneas" de la web (frontend/web/src/paginas/MisLineas.tsx) llegará en otro sprint.
export default function Lineas() {
  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <View style={estilos.tarjeta}>
        <Text style={estilos.subtitulo}>Tus líneas, muy pronto</Text>
        <Text style={estilos.texto}>
          Aquí guardarás los trayectos que haces cada día y te avisaremos si tu tren va con retraso. Mientras
          tanto, puedes ver todos los trenes en circulación en el mapa.
        </Text>
        <Boton texto="Ver trenes en directo" onPress={() => router.navigate("/directo")} />
      </View>
    </ScrollView>
  );
}
