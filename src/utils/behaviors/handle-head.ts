import { ALCIBIADES_TITLE, GRID_STYLE } from "../../consts";

type Language = "en" | "gr";

export const createHandleHead = (language: Language) => (element: HTMLElement) => {
  const doc = element.ownerDocument;
  element.textContent = "";
  Object.assign(element.style, {
    ...GRID_STYLE,
  });

  const title = doc.createElement("h1");
  title.textContent = language === "gr" ? ALCIBIADES_TITLE.GR : ALCIBIADES_TITLE.EN;
  Object.assign(title.style, {
    ...(language === "gr"
      ? { fontFamily: "Porson" }
      : { fontFamily: "var(--font-body)", textTransform: "none" }),
    textAlign: "center",
    lineHeight: "1.5",
    gridColumn: "text",
  });

  element.append(title);
};
