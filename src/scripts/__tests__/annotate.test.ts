import { describe, it, expect, vi, beforeEach } from "vitest";
import { annotate } from "../annotate";
import type { AnchorIndex } from "../injectAnchors";

function setupAnnotateDOM(lang: "en" | "gr", comments: object[]) {
  document.body.innerHTML = "";

  const script = document.createElement("script");
  script.id = `comments-${lang}`;
  script.type = "application/json";
  script.textContent = JSON.stringify({ comments, anchorPositions: [] });
  document.body.appendChild(script);
}

function makeAnchorIndex(entries: [string, HTMLElement][]): AnchorIndex {
  return new Map(entries);
}

describe("annotate", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("does nothing when no script tag exists", () => {
    document.body.innerHTML = "";
    const container = document.createElement("div");
    expect(() => annotate(container, "en", new Map())).not.toThrow();
  });

  it("does nothing when comments array is empty", () => {
    setupAnnotateDOM("en", []);
    const container = document.createElement("div");
    expect(() => annotate(container, "en", new Map())).not.toThrow();
  });

  it("does nothing when no boundaries found (missing anchors)", () => {
    setupAnnotateDOM("en", [
      { id: "c1", firstRead: false, targets: [{ stephanus: "73a1" }], body: "" },
    ]);
    const container = document.createElement("div");
    // No anchors in index → no boundaries → no annotation
    annotate(container, "en", new Map());
    expect(document.querySelectorAll(".annotated")).toHaveLength(0);
  });

  it("wraps text in .annotated span for stephanus target", () => {
    // Build DOM with a tei-container, lb elements, and text
    const teiContainer = document.createElement("tei-container");

    const lb1 = document.createElement("tei-lb");
    lb1.setAttribute("n", "73a1");
    teiContainer.appendChild(lb1);

    const anchor = document.createElement("span");
    anchor.id = "a-73a1";
    anchor.className = "tei-anchor";
    anchor.dataset.stephanus = "73a1";
    teiContainer.appendChild(anchor);

    const p = document.createElement("p");
    p.textContent = "Socrates spoke wisely.";
    teiContainer.appendChild(p);

    const lb2 = document.createElement("tei-lb");
    lb2.setAttribute("n", "73b1");
    teiContainer.appendChild(lb2);

    const anchor2 = document.createElement("span");
    anchor2.id = "a-73b1";
    anchor2.className = "tei-anchor";
    anchor2.dataset.stephanus = "73b1";
    teiContainer.appendChild(anchor2);

    document.body.appendChild(teiContainer);

    setupAnnotateDOM("en", [
      {
        id: "c1",
        firstRead: false,
        targets: [{ match: "Socrates" }],
        body: "",
      },
    ]);

    // Comment with match target needs a stephanus anchor too
    const comment = {
      id: "c1",
      firstRead: false,
      targets: [{ stephanus: "73a1", match: "Socrates" }],
      body: "",
    };

    // Reset and re-setup with match target
    document.body.innerHTML = "";
    const teiContainer2 = document.createElement("tei-container");

    const anch = document.createElement("span");
    anch.id = "a-73a1";
    anch.className = "tei-anchor";
    anch.dataset.stephanus = "73a1";
    teiContainer2.appendChild(anch);

    const p2 = document.createElement("p");
    p2.textContent = "Socrates spoke wisely.";
    teiContainer2.appendChild(p2);

    document.body.appendChild(teiContainer2);

    const script = document.createElement("script");
    script.id = "comments-en";
    script.type = "application/json";
    script.textContent = JSON.stringify({ comments: [comment], anchorPositions: [] });
    document.body.appendChild(script);

    const anchorIndex = makeAnchorIndex([["73a1", anch]]);
    annotate(teiContainer2, "en", anchorIndex);

    const annotated = document.querySelectorAll(".annotated");
    expect(annotated.length).toBeGreaterThan(0);
    const annotatedText = Array.from(annotated).map((el) => el.textContent).join("");
    expect(annotatedText).toContain("Socrates");
  });

  it("sets data-note-ids on annotated spans", () => {
    document.body.innerHTML = "";
    const container = document.createElement("div");

    const anch = document.createElement("span");
    anch.id = "a-73a1";
    anch.className = "tei-anchor";
    anch.dataset.stephanus = "73a1";
    container.appendChild(anch);

    const p = document.createElement("p");
    p.textContent = "Virtue is knowledge.";
    container.appendChild(p);

    document.body.appendChild(container);

    const script = document.createElement("script");
    script.id = "comments-en";
    script.type = "application/json";
    script.textContent = JSON.stringify({
      comments: [
        { id: "note1", firstRead: false, targets: [{ stephanus: "73a1", match: "Virtue" }], body: "" },
      ],
      anchorPositions: [],
    });
    document.body.appendChild(script);

    const anchorIndex = makeAnchorIndex([["73a1", anch]]);
    annotate(container, "en", anchorIndex);

    const annotated = document.querySelector(".annotated");
    expect(annotated?.getAttribute("data-note-ids")).toContain("en:note1");
  });

  it("skips targets with no stephanus anchor", () => {
    document.body.innerHTML = "";
    const container = document.createElement("div");
    document.body.appendChild(container);

    const script = document.createElement("script");
    script.id = "comments-en";
    script.type = "application/json";
    script.textContent = JSON.stringify({
      comments: [
        { id: "c1", firstRead: false, targets: [{ stephanus: "missing" }], body: "" },
      ],
      anchorPositions: [],
    });
    document.body.appendChild(script);

    annotate(container, "en", new Map());
    expect(document.querySelectorAll(".annotated")).toHaveLength(0);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("missing"));
  });

  it("skips targets with no startStephanus", () => {
    document.body.innerHTML = "";
    const container = document.createElement("div");
    document.body.appendChild(container);

    const script = document.createElement("script");
    script.id = "comments-en";
    script.type = "application/json";
    script.textContent = JSON.stringify({
      comments: [
        { id: "c1", firstRead: false, targets: [{ match: "something" }], body: "" },
      ],
      anchorPositions: [],
    });
    document.body.appendChild(script);

    annotate(container, "en", new Map());
    expect(document.querySelectorAll(".annotated")).toHaveLength(0);
  });
});
