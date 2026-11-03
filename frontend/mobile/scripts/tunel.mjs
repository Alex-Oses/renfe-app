// Expo Go desde cualquier red: túnel de ngrok para el bundle y API pública (localhost no llega al móvil).
import { spawn } from "node:child_process";

const api = process.env.EXPO_PUBLIC_API_URL;
const env = { ...process.env };
if (!api || /localhost|127\.0\.0\.1|192\.168\./.test(api)) {
  env.EXPO_PUBLIC_API_URL = process.env.API_PUBLICA_URL ?? "https://aleeex.tail3409a7.ts.net";
}
console.log(`API para el móvil: ${env.EXPO_PUBLIC_API_URL}`);
spawn("npx", ["expo", "start", "--tunnel", "--clear"], { stdio: "inherit", env, shell: true }).on("exit", (c) => process.exit(c ?? 0));
