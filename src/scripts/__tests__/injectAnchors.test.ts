import { describe, it, expect, vi, beforeEach } from "vitest";
import { injectAnchors } from "../injectAnchors";

function setupDom(lang: "en" | "gr", anchorPositions: string[], lbPositions: string[]) {
  document.body.innerHTML = "";

  // Create script tag with JSON data
  const script = document.createElement("script");
  script.id = `comments-${lang}`;
  script.type = "application/json";
  script.textContent = JSON.stringify({ anchorPositions });
  document.body.appendChild(script);

  // Create container with tei-lb elements
  const container = document.createElement("div");
  for (const pos of lbPositions) {
    const lb = document.createElement("tei-lb");
    lb.setAttribute("n", pos);
    container.appendChild(lb);
  }
  document.body.appendChild(container);

  return container;
}

describe("injectAnchors", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("returns empty map when no script tag exists", () => {
    document.body.innerHTML = "";
    const container = document.createElement("div");
    const result = injectAnchors(container, "en");
    expect(result.size).toBe(0);
  });

  it("returns empty map when anchorPositions is empty", () => {
    const container = setupDom("en", [], []);
    const result = injectAnchors(container, "en");
    expect(result.size).toBe(0);
  });

  it("returns empty map for invalid JSON in script tag", () => {
    document.body.innerHTML = `<script id="comments-en">{invalid json}</script>`;
    const container = document.createElement("div");
    const result = injectAnchors(container, "en");
    expect(result.size).toBe(0);
  });

  it("creates anchor spans for matching tei-lb elements", () => {
    const container = setupDom("en", ["73a1", "74b2"], ["73a1", "74b2"]);
    const result = injectAnchors(container, "en");

    expect(result.size).toBe(2);
    expect(result.has("73a1")).toBe(true);
    expect(result.has("74b2")).toBe(true);
  });

  it("sets correct id and class on anchor spans", () => {
    const container = setupDom("en", ["73a1"], ["73a1"]);
    injectAnchors(container, "en");

    const anchor = document.getElementById("a-73a1");
    expect(anchor).not.toBeNull();
    expect(anchor?.className).toBe("tei-anchor");
    expect(anchor?.dataset.stephanus).toBe("73a1");
  });

  it("inserts anchor after tei-lb element", () => {
    const container = setupDom("en", ["73a1"], ["73a1"]);
    injectAnchors(container, "en");

    const lb = container.querySelector('tei-lb[n="73a1"]')!;
    expect(lb.nextElementSibling?.id).toBe("a-73a1");
  });

  it("warns and skips positions with no matching tei-lb", () => {
    const container = setupDom("en", ["73a1", "missing"], ["73a1"]);
    const result = injectAnchors(container, "en");

    expect(result.size).toBe(1);
    expect(result.has("73a1")).toBe(true);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("missing"));
  });

  it("works with greek language", () => {
    const container = setupDom("gr", ["73a1"], ["73a1"]);
    const result = injectAnchors(container, "gr");
    expect(result.size).toBe(1);
  });
});
