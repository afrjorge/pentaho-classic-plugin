import type { AppShellVitePluginOptions, HvAppShellConfig } from "@hitachivantara/app-shell-vite-plugin";

export default (
  _opts: AppShellVitePluginOptions,
  env: Record<string, string>
): HvAppShellConfig => ({
  name: "Pentaho App Shell",
  baseUrl: env.VITE_BASE_URL || "/pentaho/content/app-shell/webclient/",

  header: {
    actions: [
      {
        bundle: "@hv/help-client/button.js",
        config: {
          url: "https://www.hitachivantara.com/",
          description: "Hitachi Vantara Help Link"
        }
      }, {
        bundle: "@hv/theming-client/colorModeSwitcher.js"
      },
    ]
  },

  mainPanel: {
    maxWidth: "xl"
  },

  navigationMode: "ONLY_LEFT"
});
