import { HvAppShellEventNotification, HvAppShellEventNotificationTrigger } from "@hitachivantara/app-shell-events";
import { HvSnackbarVariant } from "@hitachivantara/uikit-react-core";

export const HOST = import.meta.env.VITE_HOST ?? "";

export const createSnackbar = (message: string, variant: HvSnackbarVariant) => {
  const customEvent = new CustomEvent<HvAppShellEventNotification>(HvAppShellEventNotificationTrigger, {
    detail: {
      type: "snackbar",
      variant,
      message,
    }
  });

  globalThis.dispatchEvent(customEvent);
}

export const objectsEqual = <T>(
  currentObj: T,
  initialObj: T,
  ignoreUndefined: boolean = false,
): boolean => {
  if (currentObj === initialObj) {
    return true;
  }

  if (
    !(currentObj && typeof currentObj === "object") ||
    !(initialObj && typeof initialObj === "object")
  ) {
    return false;
  }

  const currentKeys = Object.keys(currentObj);
  const initialKeys = Object.keys(initialObj);

  const filteredCurrentKeys = ignoreUndefined
    ? currentKeys.filter((key) => currentObj[key as keyof T] !== undefined)
    : currentKeys;
  const filteredInitialKeys = ignoreUndefined
    ? initialKeys.filter((key) => initialObj[key as keyof T] !== undefined)
    : initialKeys;

  return (
    filteredCurrentKeys.length === filteredInitialKeys.length &&
    filteredCurrentKeys.every(
      (key) =>
        filteredInitialKeys.includes(key) &&
        objectsEqual(
          currentObj[key as keyof T],
          initialObj[key as keyof T],
          ignoreUndefined,
        ),
    )
  );
};

export const buildAnalyzerUrl = (path: string, mode: string, locale: string) => {
  const file = path.replaceAll("/", ":");

  return `${HOST}/pentaho/api/repos/${file}/${mode}?showRepositoryButtons=true&locale=${locale}`;
}

export const buildCDAUrl = (path: string) => {
  return `${HOST}/pentaho/plugin/cda/api/previewQuery?path=${path}`;
}

export const buildFileContentUrl = (path: string) => {
  const file = path.replaceAll("/", ":");

  return `${HOST}/pentaho/api/repos/${file}/content`;
}

export const buildFileGeneratedContentUrl = (path: string) => {
  const file = path.replaceAll("/", ":");

  return `${HOST}/pentaho/api/repos/${file}/generatedContent`;
}

export const buildFileViewerUrl = (path: string) => {
  const file = path.replaceAll("/", ":");

  return `${HOST}/pentaho/api/repos/${file}/viewer`;
}

export const buildPRPTIUrl = (path: string, mode: string) => {
  const file = path.replaceAll("/", ":");

  return `${HOST}/pentaho/api/repos/${file}/prpti.${mode === "viewer" ? "view" : "edit"}`;
}
