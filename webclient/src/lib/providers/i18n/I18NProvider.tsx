import React from "react";
import { I18nextProvider } from "react-i18next";
import useI18nInstance from "./i18n";

const I18NProvider = ({ children }: React.PropsWithChildren) => {
    const i18n = useI18nInstance();
    if (!i18n) {
        return null;
    }
    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default I18NProvider;