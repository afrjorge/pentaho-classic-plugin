import {useEffect, useState} from "react";
import { useSWR } from "./config";

const API = "/pentaho/api/session";
const USER_ANONYMOUS = "anonymousUser";

const getUsername = async (url: RequestInfo | URL) => {
  try {
    const response = await fetch(url);

    const username = await response.text();
    if (response.ok && !username.startsWith("<!doctype html>")) {
      return username;
    }
  } catch(error) {
    console.error("error getting username", error);
  }

  return null;
}
export default () => {
  const [username, setUsername] = useState(USER_ANONYMOUS);

  const {
    data,
    isLoading,
    ...others
  } = useSWR(() => `${API}/userName`, getUsername);

  useEffect(() => {
    if (!isLoading && data != null) {
      setUsername(data);
    }
  }, [data, isLoading]);

  return {
    username,
    isLoading,
    ...others
  };
}
