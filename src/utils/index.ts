import {
  handleLineBegin,
  handleLabel,
  handleTeiHeader,
  handleDiv,
  handleHead,
} from "./behaviors";
import type { ProcessedTei } from "./processTei";
import { ShowState, type UrlParams } from "../types";
import { STEPHANUS_COLUMN_REGEX } from "../consts";

export * from "./behaviors";

export const customBehaviors = {
  teiHeader: handleTeiHeader,
  div: handleDiv,
  lb: handleLineBegin,
  label: handleLabel,
  head: handleHead,
};

export const parseStephanusReference = (reference: string) => {
  const [page, column, line] = reference.split(STEPHANUS_COLUMN_REGEX);
  return { page, column, line };
};

export const getStephanusLineMarker = (
  page: string,
  column: string,
  line: string,
) => {
  if (line === "1") {
    return column === "a" ? page : column;
  } else {
    return line;
  }
};

export const getLineNumbersFromTeiDom = (teiDom: ProcessedTei["dom"]) =>
  Array.from(teiDom.querySelectorAll("tei-lb")).map((lb) =>
    lb.getAttribute("n"),
  );

export const getUrlWithSearchParam = (key: UrlParams, value: string) => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  params.set(key, value);
  url.search = params.toString();
  return url;
};

export const addOrUpdateUrlParam = (key: UrlParams, value: string) => {
  const url = getUrlWithSearchParam(key, value);
  window.history.replaceState({}, "", url.toString());
};

export const getShowStateFromUrl = (): ShowState => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  const showStates = params.getAll("show") as ShowState[];

  if (showStates.length === 0 || showStates.includes(ShowState.FIRST_READ)) {
    return ShowState.FIRST_READ;
  }

  if (showStates.length > 1) {
    return showStates.includes(ShowState.ENGLISH) &&
      showStates.includes(ShowState.GREEK)
      ? ShowState.BOTH
      : ShowState.FIRST_READ;
  }

  return showStates[0];
};
