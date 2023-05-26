import React, { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { css } from "@emotion/css";
import { useNavigate } from "react-router-dom";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import I18NProvider from "./i18n/I18NProvider";
import { HvButton, HvContainer, HvEmptyState } from "@hitachivantara/uikit-react-core";
import { Info } from "@hitachivantara/uikit-react-icons";

const HEADER_HEIGHT = 44;

const styles = {
  empty: css({
    alignItems: "center",
    height: `calc(100vh - ${HEADER_HEIGHT}px)`,
  }),
  container: css({
    minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
  }),
};

const CustomFallback: React.FC<FallbackProps> = ({error, resetErrorBoundary}) => {
  const {t} = useTranslation("error");
  const navigate = useNavigate();

  return (
    <HvContainer className={styles.container}>
      <HvEmptyState
        className={styles.empty}
        title={t("notFound.title")}
        message={t("notFound.message")}
        icon={<Info/>}
        action={
          <HvButton
            onClick={() => {
              resetErrorBoundary();
              navigate(-1);
            }}
          >
            {t("notFound.action")}
          </HvButton>
        }
      />
    </HvContainer>
  )
}

const Provider = ({children}: { children: React.ReactNode }) => {
  return (
    <I18NProvider>
      {children}
    </I18NProvider>
  );
};

const withProvider = <
  P extends Record<string, unknown> = Record<string, unknown>,
>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";

  const ComponentWithProvider: React.FC<P> = (props) => {
    return (
      <ErrorBoundary FallbackComponent={CustomFallback}>
        <Suspense fallback>
          <Provider>
            <WrappedComponent {...props} />
          </Provider>
        </Suspense>
      </ErrorBoundary>
    );
  };

  ComponentWithProvider.displayName = `withProvider(${displayName})`;

  return ComponentWithProvider;
};

export default withProvider;
