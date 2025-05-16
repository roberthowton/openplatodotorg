export const handleTeiHeader = (element: HTMLElement) => {
  // hide elements displayed by default
  const title = element.querySelector("tei-title");
  const author = element.querySelector("tei-author");
  const editor = element.querySelector("tei-editor");
  title?.setAttribute("style", "display: none;");
  author?.setAttribute("style", "display: none;");
  editor?.setAttribute("style", "display: none;");

  //create dramatis personae div
  const dramatisPersonae = document.createElement("div");
  dramatisPersonae.setAttribute("class", "dramatis-personae");
  Object.assign(dramatisPersonae.style, {
    display: "flex",
    justifyContent: "space-around",
    width: "80%",
  });

  //append dramatis personae to div
  element.querySelectorAll("tei-person").forEach((personElement) => {
    const person = document.createElement("div");
    person.setAttribute("class", "person");
    const personName = personElement.querySelector("tei-persName")?.innerHTML;
    person.innerHTML = personName || "";
    dramatisPersonae.appendChild(person);
  });

  //append dramatis personae to tei-head element
  document
    .querySelector("tei-head")
    ?.insertAdjacentElement("afterend", dramatisPersonae);
};
