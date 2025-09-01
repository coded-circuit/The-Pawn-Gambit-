import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/the-last-pawn",
  css: {
    preprocessorOptions: {
      scss: {
        // Use tokens-only partial to avoid self-import loop when processing theme.scss
        additionalData: `@use "/src/global/_theme-tokens.scss" as theme;`,
      },
    },
  },
});
