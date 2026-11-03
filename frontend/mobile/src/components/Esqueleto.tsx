import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, type DimensionValue, type ViewStyle } from "react-native";

// Bloque gris que late mientras carga, como .esqueleto de la web. Sin animación si se pide reducir movimiento.
export function Esqueleto({ alto = 16, ancho = "100%", style }: { alto?: number; ancho?: DimensionValue; style?: ViewStyle }) {
  const opacidad = useRef(new Animated.Value(0.55)).current;
  useEffect(() => {
    let bucle: Animated.CompositeAnimation | undefined;
    let vivo = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reducir) => {
      if (!vivo || reducir) return;
      bucle = Animated.loop(
        Animated.sequence([
          Animated.timing(opacidad, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(opacidad, { toValue: 0.55, duration: 700, useNativeDriver: true }),
        ]),
      );
      bucle.start();
    });
    return () => {
      vivo = false;
      bucle?.stop();
    };
  }, [opacidad]);
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ height: alto, width: ancho, borderRadius: 8, backgroundColor: "rgba(0,0,0,0.08)", opacity: opacidad }, style]}
    />
  );
}
