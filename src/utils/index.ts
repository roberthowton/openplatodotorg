import {
  handleLineBegin,
  handleLabel,
  handleTeiHeader,
  handleDiv,
  handleHead,
} from "./behaviors";
import type { ProcessedTei } from "./processTei";
import type { UrlParams } from "../types";
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

export const addOrUpdateUrlParam = (key: UrlParams, value: string) => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  params.set(key, value);
  url.search = params.toString();
  window.history.replaceState({}, "", url.toString());
};
