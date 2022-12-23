/// <reference types="vite/client" />
import { resolve } from "path";

import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    target: "esnext",
    cssCodeSplit: false,
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    sourcemap: true,
    minify: false,

    lib: {
      entry: {
        // we need this fake input to specify the formats
        // ignore: "this is required but ignored",
        ui: resolve(__dirname, "src/ui/index.html"),
        core: resolve(__dirname, "src/code/index.ts"),
      },
      formats: ["es"],
    },

    rollupOptions: {
      plugins: [
        // Just in case we use any npm modules...
        // Docs: https://github.com/rollup/plugins/tree/master/packages/commonjs
        nodeResolve({
          browser: true,
          dedupe: (importee) =>
            importee === "svelte" || importee.startsWith("svelte/"),
          extensions: [".svelte", ".mjs", ".js", ".json", ".node"],
        }),

        commonjs(),
      ],

      // make sure to externalize deps that shouldn't be bundled
      external: ["@figma/plugin-typings"],

      output: {
        // Provide global variables
        globals: {
          "@figma/plugin-typings": "figma",
        },
        inlineDynamicImports: false,
        dir: "plugin",
        format: "es",
      },

      watch: {
        buildDelay: 1000,
      },
    },
  },
});
