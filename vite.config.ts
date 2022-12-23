/// <reference types="vite/client" />
import { resolve } from "path";

import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

/* Inline to single html */
import htmlBundle from "rollup-plugin-html-bundle";
import { createFilter } from "rollup-pluginutils";

type FilterOptions = {
  include?: string | string[];
  exclude?: string | string[];
};

function filterFiles(options: FilterOptions = {}) {
  // `options.include` and `options.exclude` can each be a minimatch
  // pattern, or an array of minimatch patterns, relative to process.cwd()
  var filter = createFilter(options.include, options.exclude);

  return {
    transform(code, id) {
      // if `options.include` is omitted or has zero length, filter
      // will return `true` by default. Otherwise, an ID must match
      // one or more of the minimatch patterns, and must not match
      // any of the `options.exclude` patterns.
      if (!filter(id)) {
        console.log("======= Filtered:", id);
        return;
      }

      return null;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    target: "esnext",
    // assetsInlineLimit: 100000000,
    // chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    lib: {
      entry: {
        // key is the output file name, value is the entry file path
        core: resolve(__dirname, "src/code/index.ts"),
        ui: resolve(__dirname, "src/ui/main.ts"),
      },
      formats: ["es", "cjs"],
    },

    rollupOptions: {
      // input: {
      //   ui: resolve(__dirname, "src/ui/index.html"),
      // },

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

        filterFiles({
          exclude: ["src/code/**/*"],
        }),

        htmlBundle({
          template: "src/ui/index.html",
          target: "plugin/ui.html",
          inline: false,
          commonjs: true,
          htmlBundle: {
            minify: true,
          },
        }),
      ],
      // make sure to externalize deps that shouldn't be bundled
      external: ["@figma/plugin-typings"],
      output: {
        // Provide global variables
        globals: {
          figma: "Figma",
        },

        inlineDynamicImports: false,
        dir: "plugin",
      },
      watch: {
        buildDelay: 1000,
      },
    },
  },
});
