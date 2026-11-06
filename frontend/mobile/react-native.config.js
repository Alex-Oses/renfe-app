// onnxruntime-react-native trae un `unimodule.json` (formato de módulo Expo antiguo) y su propio
// `android/build.gradle`. expo-modules-autolinking descarta los paquetes que parecen módulo Expo y no
// redirigen su gradle (`reactNativeConfig/androidResolver.js`), así que el módulo nativo no se
// enlazaba, `NativeModules.Onnxruntime` no existía y el facial se caía al cargar los modelos.
// Declararlo aquí (el `dependencies` del proyecto manda sobre el config del paquete) fuerza su
// enlazado como módulo de React Native.
module.exports = {
  dependencies: {
    "onnxruntime-react-native": {
      platforms: {
        android: { sourceDir: "android" },
        ios: {},
      },
    },
  },
};
