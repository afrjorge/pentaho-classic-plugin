import { useEffect, useState } from "react";
import { useSWR } from "./config";

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
        owner: null,
        update: Date.now() - lastUse
      }
    });
  } catch (error) {
    console.error("error parsing user setting files", error);
  }

  return [];
};

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
  return useSWR(`/pentaho/api/user-settings/${setting}`, getUserSettings);
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
