import { parseStephanusReference } from "..";
import {
  ALCIBIADES_FIRST_LINE_STEPHANUS_REFERENCE,
  GRID_STYLE,
} from "../../consts";

export const handleTeiHeader = (element: Element) => {
  // hide elements displayed by default
  const title = element.querySelector("tei-title");
  const author = element.querySelector("tei-author");
  const editor = element.querySelector("tei-editor");
  title?.setAttribute("style", "display: none;");
  author?.setAttribute("style", "display: none;");
  editor?.setAttribute("style", "display: none;");

  //create dramatis personae grid container
  const dramatisPersonaeContainer = document.createElement("section");
  dramatisPersonaeContainer.setAttribute("id", "dramatis-personae-container");
  Object.assign(dramatisPersonaeContainer.style, {
    ...GRID_STYLE,
    margin: "1em 0",
  });

  //create dramatis personae div
  const dramatisPersonae = document.createElement("div");
  dramatisPersonae.setAttribute("class", "dramatis-personae");
  Object.assign(dramatisPersonae.style, {
    display: "flex",
    justifyContent: "center",
    gridColumn: "text",
  });

  //append dramatis personae to div
  element.querySelectorAll("tei-person").forEach((personElement) => {
    const person = document.createElement("div");
    person.setAttribute("class", "person");
    const personName = personElement.querySelector("tei-persName")?.innerHTML;
    person.style.margin = "0 2rem";
    person.innerHTML = personName || "";
    dramatisPersonae.appendChild(person);
  });

  //append dramatis personae div to container
  dramatisPersonaeContainer.appendChild(dramatisPersonae);

  //create and append stephanus page
  const { page } = parseStephanusReference(
    ALCIBIADES_FIRST_LINE_STEPHANUS_REFERENCE,
  );

  const startingPageDiv = document.createElement("div");
  Object.assign(startingPageDiv.style, {
    fontStyle: "italic",
    fontWeight: "800",
    gridColumn: "lineRef",
  });
  startingPageDiv.innerText = page;
  startingPageDiv.ariaHidden = "true";

  dramatisPersonaeContainer.appendChild(startingPageDiv);

  //append dramatis personae container to tei-head element
  document
    .querySelector("tei-head")
    ?.insertAdjacentElement("afterend", dramatisPersonaeContainer);
};
