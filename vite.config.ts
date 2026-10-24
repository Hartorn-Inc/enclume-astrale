/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  base: "/enclume-astrale/",
  test: {
    environment: "node",
    globals: true
  }
});
