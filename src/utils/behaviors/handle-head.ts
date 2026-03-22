import { GRID_STYLE } from "../../consts";
import type { DialogueConfig } from "../../types";

type Language = "en" | "gr";

export const createHandleHead = (language: Language, config: DialogueConfig) => (element: HTMLElement) => {
  const doc = element.ownerDocument;
  element.textContent = "";
  Object.assign(element.style, {
    ...GRID_STYLE,
  });

  const title = doc.createElement("h1");
  title.textContent = config.teiTitle[language] ?? config.teiTitle.en;
  Object.assign(title.style, {
    ...(language === "gr"
      ? { fontFamily: "Porson" }
      : { fontFamily: "var(--font-body)", textTransform: "none" }),
    fontWeight: "normal",
    textAlign: "center",
    lineHeight: "1.5",
    gridColumn: "text",
  });

  element.append(title);
};
