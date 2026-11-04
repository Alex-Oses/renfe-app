// Entrada sutil de las secciones, como el `.revela` de la web: opacidad + desplazamiento corto.
// Se usa el Animated de React Native (sin dependencias nuevas) y se respeta «reducir movimiento».
import { useEffect, useRef, type ReactNode } from "react";
import { AccessibilityInfo, Animated, Easing, type StyleProp, type ViewStyle } from "react-native";

export function Revela({
  children,
  delay = 0,
  distancia = 16,
  style,
}: {
  children: ReactNode;
  delay?: number;
  distancia?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const avance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let vivo = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reducir) => {
        if (!vivo) return;
        if (reducir) return avance.setValue(1);
        Animated.timing(avance, {
          toValue: 1,
          duration: 460,
          delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });
    return () => {
      vivo = false;
    };
  }, [avance, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: avance,
          transform: [{ translateY: avance.interpolate({ inputRange: [0, 1], outputRange: [distancia, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** Fundido simple para respuestas que aparecen (FAQ, resultados de un buscador). */
export function Aparece({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Revela distancia={6} style={style}>
      {children}
    </Revela>
  );
}
