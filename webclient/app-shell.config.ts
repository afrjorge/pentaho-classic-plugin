import type { AppShellVitePluginOptions, HvAppShellConfig } from "@hitachivantara/app-shell-vite-plugin";

export default (
  _opts: AppShellVitePluginOptions,
  env: Record<string, string>
): HvAppShellConfig => ({
  name: "App Shell Home",

  baseUrl: env.VITE_BASE_URL || "/pentaho/content/app-shell-home/webclient/",

  mainPanel: {
    maxWidth: "xl",
    views: [{
      bundle: "@self/pages/Home.js", route: "/home"
    }]
  },
});
