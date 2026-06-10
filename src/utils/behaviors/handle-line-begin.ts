import type { DialogueConfig } from "../../types";

type Language = "en" | "gr";

export const createHandleLineBegin = (language: Language, config: DialogueConfig) => (element: HTMLElement) => {
  const doc = element.ownerDocument;
  const nextTextNode = getNextTextNode(element);

  if (!nextTextNode) {
    return;
  }

  const shouldBreak = element.getAttribute("break") === "no";
  if (shouldBreak) {
    if (nextTextNode?.nodeType === 3 /* Node.TEXT_NODE */) {
      nextTextNode.textContent = nextTextNode.textContent?.concat("-") ?? "";
    }
  }

  const rangeToNextLineBegin = getRangeToNextLineBegin(element, doc);

  const textDiv = renderRangeInDiv(rangeToNextLineBegin, doc);

  // add class to handle justify text
  const isLastLine = !element.nextSibling;
  textDiv.classList.add("stephanus-line");

  // exclude the last line in each speech block
  if (isLastLine) {
    textDiv.classList.add("last");
  }

  element.appendChild(textDiv);

  element.classList.add("tei-grid");

  const ref = element.getAttribute("n") ?? "";
  const scheme = config.referenceScheme;
  const parsed = scheme.parse(ref) ?? { ref };
  const isFirstLine = ref === config.firstLineReference;

  // Create unique IDs with language suffix
  element.id = `${ref}-${language}`;
  textDiv.id = `${ref}-${language}-text`;

  // Inline marker for narrow viewports — always rendered, CSS controls visibility
  {
    const inlineMarker = doc.createElement("b");
    inlineMarker.className = "line-marker-inline";
    const markerText = scheme.inlineMarker(parsed, { ref, isFirstLine });
    inlineMarker.textContent = markerText ? `[${markerText}] ` : "";
    inlineMarker.setAttribute("aria-hidden", "true");
    textDiv.prepend(inlineMarker);
  }

  // Block marker for wide viewports — scheme decides cadence
  // Always rendered; CSS can hide via tei-container[data-hide-line-numbers="true"]
  if (scheme.showsBlockMarker(parsed)) {
    const lineMarker = doc.createElement("b");
    lineMarker.className = "line-marker-block";
    lineMarker.textContent = scheme.blockMarker(parsed, { ref, isFirstLine });
    lineMarker.setAttribute("aria-hidden", "true");
    element.appendChild(lineMarker);
  }
};

const getNextTextNode = (element: HTMLElement) => {
  let nextNode = element.nextSibling;
  while (nextNode && nextNode.nodeType !== 3 /* Node.TEXT_NODE */) {
    nextNode = nextNode.nextSibling;
  }
  return nextNode;
};

const getRangeToNextLineBegin = (element: HTMLElement, doc: Document) => {
  const range = doc.createRange();
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

const renderRangeInDiv = (range: Range, doc: Document) => {
  const container = doc.createElement("div");
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
  if (labelText) {
    container.classList.add("has-label");
  }
  return container;
};
