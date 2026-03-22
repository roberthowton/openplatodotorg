import { parseStephanusReference } from "..";
import { GRID_STYLE } from "../../consts";
import type { DialogueConfig } from "../../types";

type Language = "en" | "gr";

export const createHandleTeiHeader = (language: Language, config: DialogueConfig) => (element: Element) => {
  const doc = element.ownerDocument;

  // hide elements displayed by default
  const title = element.querySelector("tei-title");
  const author = element.querySelector("tei-author");
  const editor = element.querySelector("tei-editor");
  title?.setAttribute("style", "display: none;");
  author?.setAttribute("style", "display: none;");
  editor?.setAttribute("style", "display: none;");

  if (language === "en") {
    // hide English-only metadata elements
    const toHide = ["tei-sponsor", "tei-principal", "tei-respstmt", "tei-funder"];
    toHide.forEach((selector) => {
      element.querySelector(selector)?.setAttribute("style", "display: none;");
    });
  }

  //create dramatis personae grid container
  const dramatisPersonaeContainer = doc.createElement("section");
  dramatisPersonaeContainer.setAttribute("id", `dramatis-personae-container-${language}`);
  Object.assign(dramatisPersonaeContainer.style, {
    ...GRID_STYLE,
    margin: "1em 0",
  });

  //create dramatis personae div
  const dramatisPersonae = doc.createElement("div");
  dramatisPersonae.setAttribute("class", "dramatis-personae");
  Object.assign(dramatisPersonae.style, {
    display: "flex",
    justifyContent: "center",
    gridColumn: "text",
  });

  //append dramatis personae to div
  element.querySelectorAll("tei-person").forEach((personElement) => {
    const person = doc.createElement("div");
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
    config.firstLineStephanusReference,
  );

  const startingPageDiv = doc.createElement("div");
  Object.assign(startingPageDiv.style, {
    fontStyle: "italic",
    fontWeight: "800",
    gridColumn: "lineRef",
  });
  startingPageDiv.textContent = page;
  startingPageDiv.setAttribute("aria-hidden", "true");

  dramatisPersonaeContainer.appendChild(startingPageDiv);

  //append dramatis personae container after tei-head
  // Client-side: scope to tei-container so each column is independent.
  // Server-side: no tei-container exists yet, so traverse to the tei-tei root.
  const teiContainer = element.closest("tei-container");
  const teiHead = teiContainer
    ? teiContainer.querySelector("tei-head")
    : (element.parentElement?.querySelector("tei-head") ?? doc.querySelector("tei-head"));
  teiHead?.insertAdjacentElement("afterend", dramatisPersonaeContainer);
};
