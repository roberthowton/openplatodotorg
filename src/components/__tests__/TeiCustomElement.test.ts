import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock CETEIcean before importing the module
const mockAddBehaviors = vi.fn();
const mockApplyBehaviors = vi.fn();

vi.mock("CETEIcean", () => {
  return {
    default: class MockCETEI {
      addBehaviors = mockAddBehaviors;
      applyBehaviors = mockApplyBehaviors;
      els: string[] = [];
      utilities = { dom: null as HTMLElement | null };
    },
  };
});

import {
  parseDatasetConfig,
  applyTeiConfig,
  createTeiCustomElement,
} from "../TeiCustomElement";

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

  it("applies behaviors when useBehaviors is true", () => {
    mockAddBehaviors.mockClear();
    mockApplyBehaviors.mockClear();

    applyTeiConfig(element, {
      useBehaviors: true,
      elements: ["tei-p", "tei-div"],
    });

    expect(mockAddBehaviors).toHaveBeenCalled();
    expect(mockApplyBehaviors).toHaveBeenCalled();
  });

  it("does not apply behaviors when useBehaviors is false", () => {
    mockAddBehaviors.mockClear();
    mockApplyBehaviors.mockClear();

    applyTeiConfig(element, {
      useBehaviors: false,
      elements: [],
    });

    expect(mockAddBehaviors).not.toHaveBeenCalled();
    expect(mockApplyBehaviors).not.toHaveBeenCalled();
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

  it("connectedCallback calls parseDatasetConfig and applyTeiConfig", () => {
    mockAddBehaviors.mockClear();
    mockApplyBehaviors.mockClear();

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

    // Add connectedCallback from prototype
    Object.setPrototypeOf(element, TeiClass.prototype);
    element.connectedCallback();

    expect(element.id).toBe("test-id");
    expect(element.style.display).toBe("block");
    expect(mockAddBehaviors).toHaveBeenCalled();
  });
});
