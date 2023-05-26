import type { HvAppShellConfig } from "@hitachivantara/app-shell-vite-plugin";

export default (): HvAppShellConfig => ({
  name: "App Shell Home",

  baseUrl: "/pentaho/content/app-shell-home/webclient",

  mainPanel: {
    maxWidth: "xl",
    views: [{
      bundle: "@self/pages/Home.js", route: "/home"
    }]
  },
});
