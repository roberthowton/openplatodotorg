import { getStephanusLineMarker, parseStephanusReference } from "..";
import {
  ALCIBIADES_FIRST_LINE_STEPHANUS_REFERENCE,
  GRID_STYLE,
  LINE_NUMBERS_TO_DISPLAY,
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

  const textDiv = renderRangeInDiv(rangeToNextLineBegin);

  // add class to handle justify text
  const isLastLine = !element.nextSibling;
  textDiv.classList.add("stephanus-line");

  // exclude the last line in each speech block
  if (isLastLine) {
    textDiv.classList.add("last");
  }

  element.appendChild(textDiv);

  Object.assign(element.style, {
    ...GRID_STYLE,
  });

  const stephanusReference = element.getAttribute("n") ?? "";

  // Get language and hideLineNumbers from parent tei-container
  let parent = element.parentElement;
  while (parent && parent.tagName !== 'TEI-CONTAINER') {
    parent = parent.parentElement;
  }
  const language = (parent as HTMLElement)?.dataset?.language || 'gr';
  const hideLineNumbers = (parent as HTMLElement)?.dataset?.hideLineNumbers === 'true';

  // Create unique IDs with language suffix
  element.id = `${stephanusReference}-${language}`;
  textDiv.id = `${stephanusReference}-${language}-text`;

  const { page, column, line } = parseStephanusReference(stephanusReference);

  if (LINE_NUMBERS_TO_DISPLAY.includes(line) && !hideLineNumbers) {
    const lineMarker = document.createElement("b");
    lineMarker.innerText =
      stephanusReference === ALCIBIADES_FIRST_LINE_STEPHANUS_REFERENCE
        ? column
        : getStephanusLineMarker(page, column, line);

    Object.assign(lineMarker.style, {
      gridColumn: "lineRef",
      userSelect: "none",
      fontWeight: 800,
      fontStyle: "italic",
    });

    lineMarker.ariaHidden = "true";

    element.appendChild(lineMarker);
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
  let shouldSetRangeEndAfter = false;

  range.setStartAfter(element);

  let rangeEnd = element?.nextSibling;
  while (rangeEnd && rangeEnd.nodeName !== "TEI-LB") {
    if (rangeEnd.nextSibling) {
      rangeEnd = rangeEnd.nextSibling;
    } else {
      shouldSetRangeEndAfter = true;
      break;
    }
  }

  if (rangeEnd) {
    if (shouldSetRangeEndAfter) {
      range.setEndAfter(rangeEnd);
    } else {
      range.setEndBefore(rangeEnd);
    }
  }

  return range;
};

const renderRangeInDiv = (range: Range) => {
  const container = document.createElement("div");
  let labelText = "";

  const dom = range.extractContents();
  dom
    .querySelectorAll("tei-milestone")
    .forEach((milestone) => milestone.remove());

  const label = dom.querySelector("tei-label");
  if (label) {
    labelText = label.innerHTML;
    label.remove();
  }

  const text = dom.textContent ?? "";

  container.innerHTML = `${labelText ? `<b>${labelText}</b>` : ""} ${text.trim()}`;
  Object.assign(container.style, {
    display: "block",
    gridColumn: "text",
    textAlign: "justify",
    ...(labelText && { marginLeft: "2rem" }),
  });
  return container;
};
