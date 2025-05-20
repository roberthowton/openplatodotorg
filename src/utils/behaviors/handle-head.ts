import { ALCIBIADES_TITLE, GRID_STYLE } from "../../consts";

export const handleHead = (element: HTMLElement) => {
  element.innerText = "";
  Object.assign(element.style, {
    ...GRID_STYLE,
  });

  const title = document.createElement("h1");
  title.innerText = ALCIBIADES_TITLE.GR;
  Object.assign(title.style, {
    fontFamily: "Porson",
    textAlign: "center",
    lineHeight: 1.5,
    gridColumn: "text",
  });

  element.append(title);
};
