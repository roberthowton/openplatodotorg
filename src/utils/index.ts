import {
  createHandleLineBegin,
  createHandleTeiHeader,
  createHandleHead,
  handlePersName,
  handlePlaceName,
} from "./behaviors";
import type { ProcessedTei } from "./processTei";
import type { DialogueConfig } from "../types";

export * from "./behaviors";
export * from "./referenceSchemes";

export const createBehaviors = (language: "en" | "gr", config: DialogueConfig) => ({
  teiHeader: createHandleTeiHeader(language, config),
  lb: createHandleLineBegin(language, config),
  head: createHandleHead(language, config),
  persName: handlePersName,
  placeName: handlePlaceName,
});

export const getLineNumbersFromTeiDom = (teiDom: ProcessedTei["dom"]) =>
  Array.from(teiDom.querySelectorAll("tei-lb")).map((lb) =>
    lb.getAttribute("n"),
  );
