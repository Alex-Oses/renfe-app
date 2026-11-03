// Metro debe empaquetar los .onnx como assets: sin esto, `require` de un modelo falla al compilar.
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push("onnx");

module.exports = config;
