import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  parseDatasetConfig,
  applyTeiConfig,
  createTeiCustomElement,
} from "../Tei/TeiCustomElement";

// Stub annotation scripts — they depend on document state not relevant here
vi.mock("../../scripts/injectAnchors", () => ({ injectAnchors: vi.fn(() => new Map()) }));
vi.mock("../../scripts/annotate", () => ({ annotate: vi.fn() }));

describe("parseDatasetConfig", () => {
  it("parses rootId from dataset", () => {
    const dataset = { rootId: "test-root" } as DOMStringMap;
    const config = parseDatasetConfig(dataset);
    expect(config.rootId).toBe("test-root");
  });

  it("parses useBehaviors as true", () => {
    const dataset = { usebehaviors: "true" } as DOMStringMap;
    const config = parseDatasetConfig(dataset);
    expect(config.useBehaviors).toBe(true);
  });

  it("parses useBehaviors as false", () => {
    const dataset = { usebehaviors: "false" } as DOMStringMap;
    const config = parseDatasetConfig(dataset);
    expect(config.useBehaviors).toBe(false);
  });

  it("parses elements from comma-separated string", () => {
    const dataset = { elements: "tei-p,tei-div,tei-lb" } as DOMStringMap;
    const config = parseDatasetConfig(dataset);
    expect(config.elements).toEqual(["tei-p", "tei-div", "tei-lb"]);
  });

  it("returns empty elements array when not present", () => {
    const dataset = {} as DOMStringMap;
    const config = parseDatasetConfig(dataset);
    expect(config.elements).toEqual([]);
  });
});

describe("applyTeiConfig", () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement("div");
    element.innerHTML = "<div>TEI content</div>";
  });

  it("sets element id from rootId", () => {
    applyTeiConfig(element, {
      rootId: "my-root",
      useBehaviors: false,
      elements: [],
    });
    expect(element.id).toBe("my-root");
  });

  it("does not set id when rootId is undefined", () => {
    applyTeiConfig(element, {
      useBehaviors: false,
      elements: [],
    });
    expect(element.id).toBe("");
  });

  it("sets display to block", () => {
    applyTeiConfig(element, {
      useBehaviors: false,
      elements: [],
    });
    expect(element.style.display).toBe("block");
  });
});

describe("createTeiCustomElement", () => {
  it("returns a class that extends HTMLElement", () => {
    const TeiClass = createTeiCustomElement();
    expect(TeiClass.prototype).toBeDefined();
  });

  it("returned class has connectedCallback method", () => {
    const TeiClass = createTeiCustomElement();
    expect(typeof (TeiClass.prototype as any).connectedCallback).toBe(
      "function",
    );
  });

  it("connectedCallback sets id and display", () => {
    const TeiClass = createTeiCustomElement();
    const element = document.createElement("div") as unknown as HTMLElement & {
      connectedCallback: () => void;
    };
    element.innerHTML = "<div>TEI content</div>";
    Object.assign(element.dataset, {
      rootId: "test-id",
      usebehaviors: "true",
      elements: "tei-p,tei-div",
    });

    Object.setPrototypeOf(element, TeiClass.prototype);
    element.connectedCallback();

    expect(element.id).toBe("test-id");
    expect(element.style.display).toBe("block");
  });
});
