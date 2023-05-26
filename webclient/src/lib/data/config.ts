import baseUseSWR, { Key, SWRConfiguration } from "swr";

const defaultFetcher= (url: RequestInfo | URL) =>
  fetch(url).then((res) => res.json());

// overload the useSWR function to set the fetcher and add suspense by default
export function useSWR(
  key: Key,
  fetcher: (url: RequestInfo | URL) => Promise<any>,
  options?: SWRConfiguration,
) {
  return baseUseSWR(key, fetcher ?? defaultFetcher, {
    suspense: true,
    ...options,
  });
}

export default (
  key: Key,
  options?: SWRConfiguration,
) => useSWR(key, defaultFetcher, options);
