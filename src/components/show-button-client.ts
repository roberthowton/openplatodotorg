// Extracted helper functions from show-button.astro for testing
import { ShowState } from "../types";

export interface UrlParams {
  currentShowParams: string[];
  show: string;
}

export function buildShowUrl(baseUrl: string, show: string, isShowing: boolean): string {
  const url = new URL(baseUrl);
  const params = new URLSearchParams(url.search);

  if (isShowing) {
    // Hide action
    if (show === ShowState.FIRST_READ) {
      // Exiting first read mode - show both languages
      params.delete("show");
      params.append("show", ShowState.GREEK);
      params.append("show", ShowState.ENGLISH);
    } else {
      const currentShowParams = params.getAll("show");
      params.delete("show");

      if (currentShowParams.length === 0) {
        // No params means both shown; add the opposite language
        const opposite =
          show === ShowState.GREEK ? ShowState.ENGLISH : ShowState.GREEK;
        params.append("show", opposite);
      } else {
        // Remove this specific show state
        currentShowParams.forEach((param) => {
          if (param !== show) {
            params.append("show", param);
          }
        });
      }
    }
  } else {
    // Show action
    if (show === ShowState.FIRST_READ) {
      // Entering first read mode - clear all and set firstRead
      params.delete("show");
      params.set("show", ShowState.FIRST_READ);
    } else {
      // Add this show state if not already present
      const currentShowParams = params.getAll("show");
      if (!currentShowParams.includes(show)) {
        params.append("show", show);
      }
    }
  }

  url.search = params.toString();
  return url.href;
}

export function getShowParamsFromUrl(urlString: string): string[] {
  const url = new URL(urlString);
  return url.searchParams.getAll("show");
}
