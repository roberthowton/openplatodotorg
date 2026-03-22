import {
  createHandleLineBegin,
  handleLabel,
  createHandleTeiHeader,
  handleDiv,
  createHandleHead,
} from "./behaviors";
import type { ProcessedTei } from "./processTei";
import { STEPHANUS_COLUMN_REGEX } from "../consts";

export * from "./behaviors";

export const createBehaviors = (language: "en" | "gr") => ({
  teiHeader: createHandleTeiHeader(language),
  div: handleDiv,
  lb: createHandleLineBegin(language),
  label: handleLabel,
  head: createHandleHead(language),
});

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
