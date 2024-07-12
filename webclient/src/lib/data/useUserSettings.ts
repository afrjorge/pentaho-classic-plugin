import { useEffect, useState } from "react";
import { mutate } from "swr";
import { HvSnackbarVariant } from "@hitachivantara/uikit-react-core";
import { HvDashboardProps } from "@hitachivantara/uikit-react-lab";
import { createSnackbar } from "../utils";
import { useSWR } from "./config";
import defaultDashboard from "./defaultDashboard.json";


export interface LayoutConfig {
  cols?: number; // number of columns in the layout: area positions are based on this number
  layout?: HvDashboardProps["layout"]; // layout: available dashboard areas and their size and position
  widgets?: { id: string, module: string, moduleProps: Record<string, string> }[]; // items connected to the dashboard areas
  labels?: Record<string, string>; // dashboard area labels: the key is the area id and the value is the label
}

const API = "/pentaho/api/user-settings";

const parseUserSettingFiles = (data: string) => {
  try {
    const list = data?.length > 0 ? JSON.parse(data) : [];

    // @ts-ignore
    return list.map(({ fullPath, title, lastUse }) => {
      const tokens = fullPath.split("/");
      const { [tokens.length - 1]: filename } = tokens;

      return {
        id: filename,
        name: title,
        type: filename.split(".")[1],
        path: fullPath,
        owner: null,
        update: lastUse
      }
    });
  } catch (error) {
    console.error("error parsing user setting files", error);
  }

  return [];
};

// post methods

export const postHomeDashboard = async (dashboard?: LayoutConfig) => {
  const action = dashboard != null ? "save" : "reset";

  let snackbarVariant: HvSnackbarVariant = "error";
  let snackbarMessage = `Failed to ${action} dashboard!`;

  try {
    const url = `${API}/home-dashboard`;
    const response = await fetch(url, {
      method: "POST",
      body: action === "save" ? JSON.stringify(dashboard) : ""
    });

    if (response.ok) {
      if (action === "reset") {
        await mutate(`${API}/home-dashboard`)
      }

      snackbarVariant = "success";
      snackbarMessage = `Dashboard ${action} successful`;
    }
  } catch (error) {
    console.error(snackbarMessage, error);
  }

  createSnackbar(snackbarMessage, snackbarVariant);
}

// get methods

const getUserSettings = async (url: RequestInfo | URL) => {
  try {
    const data =  await fetch(url).then((res) => res.text());

    const okButNotOkResponse = data?.startsWith("<!doctype html>") ?? false;
    if (!okButNotOkResponse) {
      return data;
    }
  } catch (error) {
    console.error(`error getting user setting from [${url}]`, error);
  }

  return null;
};

const useUserSettings = (setting = "list") => {
  return useSWR(`${API}/${setting}`, getUserSettings);
};

export const useRecentFiles = () => {
  const [recentFiles, setRecentFiles] = useState([]);

  const {
    data,
    isLoading,
    ...others
  } = useUserSettings("recent");

  useEffect(() => {
    if (!isLoading && data != null) {
      setRecentFiles(parseUserSettingFiles(data));
    }
  }, [data, isLoading]);

  return { recentFiles, isLoading, ...others };
};

export const useFavoriteFiles = () => {
  const [favoriteFiles, setFavoriteFiles] = useState([]);

  const {
    data,
    isLoading,
    ...others
  } = useUserSettings("favorites");

  useEffect(() => {
    if (!isLoading && data != null) {
      setFavoriteFiles(parseUserSettingFiles(data));
    }
  }, [data, isLoading]);

  return { favoriteFiles, isLoading, ...others };
};

export const useHomeDashboard = () => {
  const [dashboard, setDashboard] = useState<LayoutConfig>();

  const {
    data,
    isLoading,
    ...others
  } = useUserSettings("home-dashboard");

  useEffect(() => {
    if (!isLoading) {
      const dash = data != null ? JSON.parse(data) : undefined;

      setDashboard(dash ?? defaultDashboard);
    }
  }, [data, isLoading]);

  return { dashboard, isLoading, ...others };
};

/*
 * Possible values
 *  - list: get all settings values in xml format
 *  - recent: stringified array with recent files
 *  - favorites: stringified array with favorites files
 *  - pentaho-user-theme: active theme
 *  - user_selected_language: active locale
 *  - MANTLE_SHOW_NAVIGATOR: ...
 *  - MANTLE_SHOW_HIDDEN_FILES: ...
 */
export default useUserSettings;
