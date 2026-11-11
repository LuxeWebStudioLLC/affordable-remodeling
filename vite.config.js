import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
    /* Vite rejects requests whose Host header it doesn't recognise, which
       would make any tunnel domain return "Blocked request" instead of the
       site. Only needed for sharing a preview build over a tunnel. */
    allowedHosts: true,
  },
  build: {
    target: "es2020",
    cssMinify: "lightningcss",
    rollupOptions: {
      /* Two entries: the marketing site, and the owner console at /owner.
         Keeping them separate means visitors never download the console, and
         the console never pulls in GSAP. */
      input: {
        main: resolve(__dirname, "index.html"),
        owner: resolve(__dirname, "owner.html"),
      },
    },
  },
});
