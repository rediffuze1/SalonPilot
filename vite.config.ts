import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: ".", // <-- Ajout ici, racine du projet Vite
  plugins: [react()],
  server: {
    host: "0.0.0.0", // nécessaire pour Replit
    port: 5173, // par défaut
    strictPort: false, // laisse Vite choisir un autre port si 5173 pris
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
