import { LINE_MARKER_STYLE } from "../../consts";

export const handleStephanusMilestone = (element: HTMLElement) => {
  if (!isStephanusSection(element)) {
    return;
  }
  const nAttr = element.getAttribute("n") || "";
  element.innerHTML = getStephanusSectionLabel(nAttr);
  Object.assign(element.style, {
    ...LINE_MARKER_STYLE,
  });
};

const isStephanusSection = (element: HTMLElement) => {
  const isStephanusMilestone = element.getAttribute("resp") === "Stephanus";
  const isSection = element.getAttribute("unit") === "section";
  return isStephanusMilestone && isSection;
};

const getStephanusSectionLabel = (milestone: string) =>
  milestone.endsWith("a") ? milestone : milestone.slice(-1);
