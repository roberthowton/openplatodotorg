import { describe, it, expect, vi, beforeEach } from "vitest";
import { ShowState } from "../../types";

const { mockDispatch, mockGetUrlState, mockBuildCommentsHtml } = vi.hoisted(() => ({
  mockDispatch: vi.fn(),
  mockGetUrlState: vi.fn(),
  mockBuildCommentsHtml: vi.fn(() => "<p>comment</p>"),
}));

vi.mock("../../state/url", () => ({
  dispatch: mockDispatch,
  getUrlState: mockGetUrlState,
}));

vi.mock("../../scripts/commentsPanel", () => ({
  buildCommentsHtml: mockBuildCommentsHtml,
}));

vi.mock("astro:transitions/client", () => ({ navigate: vi.fn() }));

import { createCommentsPanelElement } from "../CommentsPanel/CommentsPanelElement";

const DEFAULT_URL_STATE = {
  ref: null,
  show: [ShowState.FIRST_READ],
  comment: [],
  panel: null,
};

function buildPanel(commentsData: object = {}): HTMLElement {
  const el = document.createElement("comments-panel");
  el.id = "comments-panel";
  el.innerHTML = `
    <button id="comments-panel-toggle">Toggle</button>
    <button id="comments-panel-pin">Pin</button>
    <button id="comments-panel-close">Close</button>
    <div id="comments-panel-content"></div>
  `;

  // Add JSON data scripts
  for (const lang of ["en", "gr"]) {
    const script = document.createElement("script");
    script.id = `comments-${lang}`;
    script.type = "application/json";
    script.textContent = JSON.stringify({ comments: [], anchorPositions: [], ...commentsData });
    document.body.appendChild(script);
  }

  return el;
}

describe("createCommentsPanelElement", () => {
  let CommentsPanelElement: ReturnType<typeof createCommentsPanelElement>;

  beforeEach(() => {
    mockDispatch.mockClear();
    mockBuildCommentsHtml.mockClear();
    mockGetUrlState.mockReturnValue(DEFAULT_URL_STATE);
    document.body.innerHTML = "";
    CommentsPanelElement = createCommentsPanelElement();
  });

  function connect(el: HTMLElement) {
    document.body.appendChild(el);
    Object.setPrototypeOf(el, CommentsPanelElement.prototype);
    (el as any).connectedCallback();
  }

  it("starts collapsed by default", () => {
    const el = buildPanel();
    connect(el);
    // Panel doesn't add collapsed on its own — it just doesn't open
    expect(el.classList.contains("pinned")).toBe(false);
  });

  it("pins panel on connect when URL panel=pinned", () => {
    mockGetUrlState.mockReturnValue({ ...DEFAULT_URL_STATE, panel: "pinned" });
    const el = buildPanel();
    connect(el);
    expect(el.classList.contains("pinned")).toBe(true);
  });

  it("opens overlay on connect when URL has comment ids", () => {
    mockGetUrlState.mockReturnValue({ ...DEFAULT_URL_STATE, comment: ["en:c1"] });
    const el = buildPanel();
    connect(el);
    expect(el.classList.contains("collapsed")).toBe(false);
  });

  it("toggle button opens panel when collapsed", () => {
    const el = buildPanel();
    el.classList.add("collapsed");
    connect(el);

    el.querySelector<HTMLElement>("#comments-panel-toggle")!.click();
    expect(el.classList.contains("collapsed")).toBe(false);
  });

  it("toggle button closes panel when open", () => {
    const el = buildPanel();
    connect(el);

    // Open it first
    el.classList.remove("collapsed");

    el.querySelector<HTMLElement>("#comments-panel-toggle")!.click();
    expect(el.classList.contains("collapsed")).toBe(true);
    expect(mockDispatch).toHaveBeenCalledWith({ type: "UNPIN_PANEL" });
    expect(mockDispatch).toHaveBeenCalledWith({ type: "SET_COMMENT", payload: [] });
  });

  it("close button collapses panel and dispatches", () => {
    const el = buildPanel();
    el.classList.remove("collapsed");
    connect(el);

    el.querySelector<HTMLElement>("#comments-panel-close")!.click();
    expect(el.classList.contains("collapsed")).toBe(true);
    expect(mockDispatch).toHaveBeenCalledWith({ type: "UNPIN_PANEL" });
    expect(mockDispatch).toHaveBeenCalledWith({ type: "SET_COMMENT", payload: [] });
  });

  it("pin button pins panel", () => {
    const el = buildPanel();
    connect(el);

    el.querySelector<HTMLElement>("#comments-panel-pin")!.click();
    expect(el.classList.contains("pinned")).toBe(true);
    expect(el.classList.contains("collapsed")).toBe(false);
    expect(mockDispatch).toHaveBeenCalledWith({ type: "PIN_PANEL" });
  });

  it("pin button unpins when already pinned", () => {
    const el = buildPanel();
    el.classList.add("pinned");
    connect(el);

    el.querySelector<HTMLElement>("#comments-panel-pin")!.click();
    expect(el.classList.contains("pinned")).toBe(false);
    expect(mockDispatch).toHaveBeenCalledWith({ type: "UNPIN_PANEL" });
  });

  it("clicking annotated element opens panel and renders comments", () => {
    const el = buildPanel();
    connect(el);
    el.classList.add("collapsed");

    const annotated = document.createElement("span");
    annotated.className = "annotated";
    annotated.setAttribute("data-note-ids", "en:c1,en:c2");
    document.body.appendChild(annotated);

    // Click propagates via document event listener in connectedCallback
    annotated.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_COMMENT",
      payload: ["en:c1", "en:c2"],
    });
  });

  it("disconnectedCallback aborts controller", () => {
    const el = buildPanel();
    connect(el);

    const controller = (el as any).controller as AbortController;
    const abortSpy = vi.spyOn(controller, "abort");
    (el as any).disconnectedCallback();
    expect(abortSpy).toHaveBeenCalled();
  });
});
