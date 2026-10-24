/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  base: "/enclume-astrale/",
  build: {
    emptyOutDir: false
  },
  test: {
    environment: "node",
    globals: true
  }
});
