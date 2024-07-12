/// <reference types="vite/client" />
/// <reference types="vitest" />

import { defineConfig, loadEnv } from "vite";

import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import unoCSS from "unocss/vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

import { ApplicationBundleType, HvAppShellVitePlugin } from "@hitachivantara/app-shell-vite-plugin";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const appShellType = env.VITE_APP_SHELL_TYPE as ApplicationBundleType || "bundle";

  return {
    plugins: [
      react({
        jsxImportSource: "@emotion/react",
        babel: {
          plugins: ["@emotion/babel-plugin"],
        },
      }),
      tsconfigPaths(),
      unoCSS({ mode: "per-module" }),
      cssInjectedByJsPlugin({
        relativeCSSInjection: true,
      }),
      HvAppShellVitePlugin({
        mode,
        type: appShellType,
        autoViewsAndRoutes: true,
        autoMenu: true,
        modules: [
          "src/components/home/RecentActivity",
          "src/components/home/QuickAccess"
        ]
      }, env),
    ],

    server: {
      proxy: {
        '/pentaho/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        }
      }
    },

    test: {
      globals: true,
        environment: "happy-dom",
        setupFiles: ["src/tests/setupTests.ts"],
        reporters: "default",
        coverage: {
        enabled: false, // disabled by default. run vitest with --coverage
          provider: "v8",
          reporter: "lcov",
          include: ["src/**/*.ts?(x)"],
          exclude: [
          "src/**/mocks/*",
          "src/**/tests/*",
          "src/**/*.test.ts?(x)",
          "src/**/styles.[jt]s?(x)",
          "src/**/*.d.ts",
          "src/*.tsx",
        ],
      },
    },
  }
});
