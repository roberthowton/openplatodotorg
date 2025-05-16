import type { DialogContainerProps } from "../components/dialog-container";
import {
  handleStephanusMilestone,
  handleLineBegin,
  handleLabel,
  handleTeiHeader,
} from "./behaviors";
import type { ProcessedTei } from "./processTei";
import type { UrlParams } from "../types";

export * from "./behaviors";

export const customBehaviors = {
  teiHeader: handleTeiHeader,
  milestone: handleStephanusMilestone,
  lb: handleLineBegin,
  label: handleLabel,
};

export const wrapTextNode = (
  textNode: Node | Range,
  wrapperElement: keyof HTMLElementTagNameMap,
) => {
  if (textNode instanceof Range) {
    const wrapper = document.createElement(wrapperElement);
    textNode.surroundContents(wrapper);
    return wrapper;
  } else if (textNode.nodeType === Node.TEXT_NODE) {
    const wrapper = document.createElement(wrapperElement);
    textNode.parentNode?.insertBefore(wrapper, textNode);
    wrapper.appendChild(textNode);
    return wrapper;
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
