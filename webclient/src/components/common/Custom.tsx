import {
  forwardRef,
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ErrorBoundary, ErrorBoundaryProps } from "react-error-boundary";
import { css, cx } from "@emotion/css";
import { HvLoading, theme } from "@hitachivantara/uikit-react-core";
import { objectsEqual } from "../../lib/utils";

export interface CustomProps {
  module: string;
  moduleProps: object;
  fallbackRender?: ErrorBoundaryProps["fallbackRender"];
  loading?: boolean;
  className?: string;
}

const classes = {
  root: css({
    height: "100%",
  }),
  loadingContainer: css({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    padding: theme.space.sm,
  }),
};

// copied from https://github.com/lumada-machine-learning/digital-advisor/blob/prerelease/frontend/src/components/workbench/flow/Custom.tsx
export const Custom = forwardRef<HTMLDivElement, CustomProps>(
  function Custom(props, ref) {
    const {
      module,
      moduleProps,
      loading,
      fallbackRender,
      className,
      ...others
    } = props;

    const [modulePropsResetKey, setModulePropsResetKey] = useState(
      Math.random(),
    );
    const prevModuleProps = useRef(moduleProps);

    // Since moduleProps is an object (not a string), putting it directly inside resetKeys can create a loop
    // modulePropsResetKey is used instead to avoid this loop and reset the error boundary when the module props change
    useEffect(() => {
      const isEqual = objectsEqual(moduleProps, prevModuleProps.current);
      if (!isEqual) {
        setModulePropsResetKey(Math.random());
        prevModuleProps.current = moduleProps;
      }
    }, [moduleProps]);

    const Component = useMemo(
      () => lazy(() => import(/* @vite-ignore */ module)),
      [module],
    );

    // Reset error boundary when the module or module props changes
    const resetKeys = [module, modulePropsResetKey];

    return (
      <div ref={ref} className={cx(classes.root, className)} {...others}>
        <ErrorBoundary
          fallbackRender={fallbackRender ?? (() => null)}
          resetKeys={resetKeys}
        >
          <Suspense fallback={<span>Loading</span>}>
            {loading ? (
              <div className={classes.loadingContainer}>
                <HvLoading small />
              </div>
            ) : (
              <Component
                fallbackRender={fallbackRender}
                resetKeys={resetKeys}
                {...moduleProps}
              />
            )}
          </Suspense>
        </ErrorBoundary>
      </div>
    );
  },
);

Custom.displayName = "Custom";
