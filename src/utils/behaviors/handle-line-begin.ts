import { wrapTextNode } from "..";
import {
  LINE_MARKER_STYLE,
  LINE_NUMBERS_TO_DISPLAY,
  STEPHANUS_COLUMN_REGEX,
} from "../../consts";

export const handleLineBegin = (element: HTMLElement) => {
  const nextTextNode = getNextTextNode(element);

  if (!nextTextNode) {
    return;
  }

  const shouldBreak = element.getAttribute("break") === "no";
  if (shouldBreak) {
    if (nextTextNode?.nodeType === Node.TEXT_NODE) {
      nextTextNode.textContent = nextTextNode.textContent?.concat("-") ?? "";
    }
  }

  const rangeToNextLineBegin = getRangeToNextLineBegin(element);

  const wrappedTextNode = wrapTextNode(rangeToNextLineBegin, "span");

  if (!wrappedTextNode) {
    return;
  }

  const stephanusReference = element.getAttribute("n") ?? "";
  wrappedTextNode.id = stephanusReference;

  const lineNumber = getLineNumberFromStephanusReference(stephanusReference);

  if (LINE_NUMBERS_TO_DISPLAY.includes(lineNumber)) {
    const lineMarker = document.createElement("b");
    lineMarker.innerText = lineNumber;
    Object.assign(lineMarker.style, {
      ...LINE_MARKER_STYLE,
      fontWeight: 400,
    });

    wrappedTextNode.appendChild(lineMarker);
  }
};

const getNextTextNode = (element: HTMLElement) => {
  let nextNode = element.nextSibling;
  while (nextNode && nextNode.nodeType !== Node.TEXT_NODE) {
    nextNode = nextNode.nextSibling;
  }
  return nextNode;
};

const getRangeToNextLineBegin = (element: HTMLElement) => {
  const range = document.createRange();
  let rangeEnd = element?.nextSibling;
  while (rangeEnd && rangeEnd.nodeName !== "TEI-LB") {
    rangeEnd = rangeEnd.nextSibling;
  }
  range.setStartAfter(element);
  if (rangeEnd) {
    range.setEndBefore(rangeEnd);
  }
  return range;
};

const getLineNumberFromStephanusReference = (reference: string) =>
  reference.split(STEPHANUS_COLUMN_REGEX).slice(-1).toString();
