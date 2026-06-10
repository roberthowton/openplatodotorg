import type { DialogueConfig } from "../../types";

type Language = "en" | "gr";

export const createHandleTeiHeader = (language: Language, config: DialogueConfig) => (element: Element) => {
  const doc = element.ownerDocument;

  // hide elements displayed by default
  const title = element.querySelector("tei-title");
  const author = element.querySelector("tei-author");
  const editor = element.querySelector("tei-editor");
  title?.classList.add("tei-hidden");
  author?.classList.add("tei-hidden");
  editor?.classList.add("tei-hidden");

  if (language === "en") {
    // hide English-only metadata elements
    const toHide = ["tei-sponsor", "tei-principal", "tei-respstmt", "tei-funder"];
    toHide.forEach((selector) => {
      element.querySelector(selector)?.classList.add("tei-hidden");
    });
  }

  //create dramatis personae grid container
  const dramatisPersonaeContainer = doc.createElement("section");
  dramatisPersonaeContainer.setAttribute("id", `dramatis-personae-container-${language}`);
  dramatisPersonaeContainer.classList.add("tei-grid", "dramatis-personae-container");

  //create dramatis personae div
  const dramatisPersonae = doc.createElement("div");
  dramatisPersonae.setAttribute("class", "dramatis-personae");

  //append dramatis personae to div
  element.querySelectorAll("tei-person").forEach((personElement) => {
    const person = doc.createElement("div");
    person.setAttribute("class", "person");
    const personName = personElement.querySelector("tei-persName")?.innerHTML;
    person.innerHTML = personName || "";
    dramatisPersonae.appendChild(person);
  });

  //append dramatis personae div to container
  dramatisPersonaeContainer.appendChild(dramatisPersonae);

  //create and append starting page reference
  const scheme = config.referenceScheme;
  const firstRef = config.firstLineReference;
  const pageLabel = scheme.startingPageLabel
    ? scheme.startingPageLabel(firstRef)
    : firstRef;

  const startingPageDiv = doc.createElement("div");
  startingPageDiv.classList.add("stephanus-page-ref");
  startingPageDiv.textContent = pageLabel;
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
