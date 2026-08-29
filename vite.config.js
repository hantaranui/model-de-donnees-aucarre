import { defineConfig } from "vite";

export default defineConfig({
  // Grist charge le widget dans une iframe via une URL relative au host qui le sert :
  // un chemin relatif garantit que ça fonctionne quel que soit le sous-dossier de déploiement.
  base: "./",
  server: {
    port: 5173,
    strictPort: true
  },
  test: {
    environment: "jsdom"
  }
});
