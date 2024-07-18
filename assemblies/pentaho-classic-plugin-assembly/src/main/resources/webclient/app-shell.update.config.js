// pentaho endpoint that provides the App Shell configurations of all the plugins
const getPluginsConfig = () => {
  const url = "/pentaho/plugin/app-shell/api/config";
  const asyncRequest = false;

  const request = new XMLHttpRequest();
  request.open("GET", url, asyncRequest); // `false` makes the request synchronous
  request.send(null);

  if (request.status === 200) {
    try {
      return JSON.parse(request.responseText);
    } catch (error) {
      console.error("error parsing the plugins import map entries", error);
    }
  }

  return [];
}

const configs = getPluginsConfig();

const appShellConfig = globalThis.__appshell_config__;
const {
  // "don't merge this props. They are controlled by the pentaho app-shell"
  //  - baseUrl, logo, name, navigationMode, theming, translations
  //
  // "prop not present in final config. Used to create import map entries"
  //  - apps

  header = {},
  mainPanel = {},
  menu = [],
  providers = [],
} = appShellConfig;

configs.forEach(config => {
  if (config.header?.actions?.length > 0) {
    const { actions = [] } = header;

    header.actions = [...actions, ...config.header.actions];
    appShellConfig.header = header;
  }

  if (config.menu?.length > 0) {
    appShellConfig.menu = [...menu, ...config.menu];
  }

  if (config.providers?.length > 0) {
    appShellConfig.providers = [...providers, ...config.providers];
  }

  if (config.mainPanel?.views?.length > 0) {
    const { views = [] } = mainPanel;

    mainPanel.views = [...views, ...config.mainPanel.views];
    appShellConfig.mainPanel = mainPanel;
  }
});
