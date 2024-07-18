const getPluginsImportMap = () => {
  const url = "/pentaho/plugin/app-shell/api/importmap";
  const asyncRequest = false;

  const request = new XMLHttpRequest();
  request.open("GET", url, asyncRequest); // `false` makes the request synchronous
  request.send(null);

  const result = {};

  if (request.status === 200) {
    try {
      const importMaps = JSON.parse(request.responseText);

      importMaps.forEach(importMap => {
        Object.entries(importMap ?? {}).forEach(([key, value]) => {
          result[`${key}`] = value;
        })
      });
    } catch (error) {
      console.error("error parsing the plugins importmap entries", error);
    }


  }

  return result;
}

/* importmap entries defined by app-shell */
const BASE_MAP = {
  // shared dependencies
  "react": "./bundles/react.production.min.js",
  "react-dom": "./bundles/react-dom.production.min.js",
  "react-router-dom": "./bundles/react-router-dom.production.min.js",
  "@emotion/react": "./bundles/emotion-react.production.min.js",
  "@emotion/cache": "./bundles/emotion-cache.production.min.js",
  "@hitachivantara/app-shell-shared": "./bundles/app-shell-shared.esm.js",
  "@hitachivantara/uikit-react-shared": "./bundles/uikit-react-shared.esm.js",
  "@hv/uikit-icons/": "./icons/",

  // @self
  "@pentaho-apps/pentaho-app-shell/": "/pentaho/app-shell/"
};

const im = document.createElement("script");
im.type = "importmap";
im.textContent = JSON.stringify({
  imports: {
    ...BASE_MAP,
    ...getPluginsImportMap()
  }
}, null, 2);

document.currentScript.after(im);
