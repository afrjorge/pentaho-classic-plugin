/// <reference types="vite/client" />
/// <reference types="vitest" />

import { defineConfig, loadEnv } from "vite";

import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

import { HvAppShellVitePlugin } from "@hitachivantara/app-shell-vite-plugin";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react({
        jsxImportSource: "@emotion/react",
        babel: {
          plugins: ["@emotion/babel-plugin"],
        },
      }),
      tsconfigPaths(),
      HvAppShellVitePlugin({
        mode,

        inlineConfig: true,
        externalImportMap: false,
        type: "app"
      }, env),
    ],
    build: {
      minify: true,
      rollupOptions: {
        // hides warnings about module level directive use client
        // that many third party libraries added because of React Server Components
        onwarn(warning, warn) {
          if (
            warning.code === "MODULE_LEVEL_DIRECTIVE" &&
            warning.message.includes("use client")
          ) {
            return;
          }
          warn(warning);
        },
      },
    },
  };
});
