import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Un solo .env, el de la raíz del repo (por defecto Vite buscaría frontend/web/.env).
  envDir: "../../",
});
