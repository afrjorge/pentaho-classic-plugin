import React from "react";
import { initReactI18next } from "react-i18next";
import { createInstance, i18n } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend, { HttpBackendOptions } from "i18next-http-backend";

const useI18nInstance = () => {
  const [i18nInstance, setI18nInstance] = React.useState<i18n>();

  const initI18n = React.useCallback(async () => {
    const baseUrl = import.meta.resolve?.("@pentaho-plugin/app-shell-home/webclient/");
    const instance = createInstance();
    instance
      // load translation using xhr -> see /public/locales
      // learn more: https://github.com/i18next/i18next-xhr-backend
      .use(Backend)
      // detect user language
      // learn more: https://github.com/i18next/i18next-browser-languageDetector
      .use(LanguageDetector)
      // pass the i18n instance to react-i18next.
      .use(initReactI18next)
      // init i18next
      // for all options read: https://www.i18next.com/overview/configuration-options
      .init<HttpBackendOptions>({
        lng: "en",
        fallbackLng: "en",
        backend: {
          loadPath: `${baseUrl}locales/{{lng}}/{{ns}}.json`,
        },
        interpolation: {
          escapeValue: false, // not needed for react as it escapes by default
        },
        load: "languageOnly",
        debug: true,
      });
    return instance;
  }, []);

  React.useEffect(() => {
    initI18n().then(setI18nInstance);
  }, [initI18n]);

  return i18nInstance;
};

export default useI18nInstance;
