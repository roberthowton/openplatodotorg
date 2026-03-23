import {
  createHandleLineBegin,
  createHandleTeiHeader,
  createHandleHead,
} from "./behaviors";
import type { ProcessedTei } from "./processTei";
import { STEPHANUS_COLUMN_REGEX } from "../consts";
import type { DialogueConfig } from "../types";

export * from "./behaviors";

export const createBehaviors = (language: "en" | "gr", config: DialogueConfig) => ({
  teiHeader: createHandleTeiHeader(language, config),
  lb: createHandleLineBegin(language, config),
  head: createHandleHead(language, config),
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
