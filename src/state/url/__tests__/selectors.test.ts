import { describe, it, expect } from "vitest";
import { parseUrlState, deriveShowState, isShowActive } from "../selectors";
import { ShowState } from "../../../types";
import type { UrlState } from "../types";

describe("parseUrlState", () => {
  describe("ref param", () => {
    it("parses ref from URL", () => {
      const url = new URL("https://example.com/?ref=103a1");
      const state = parseUrlState(url);
      expect(state.ref).toBe("103a1");
    });

    it("returns null when no ref", () => {
      const url = new URL("https://example.com/");
      const state = parseUrlState(url);
      expect(state.ref).toBeNull();
    });
  });

  describe("show params", () => {
    it("defaults to FIRST_READ when no show params", () => {
      const url = new URL("https://example.com/");
      const state = parseUrlState(url);
      expect(state.show).toEqual([ShowState.FIRST_READ]);
    });

    it("parses single show=gr", () => {
      const url = new URL("https://example.com/?show=gr");
      const state = parseUrlState(url);
      expect(state.show).toEqual([ShowState.GREEK]);
    });

    it("parses single show=en", () => {
      const url = new URL("https://example.com/?show=en");
      const state = parseUrlState(url);
      expect(state.show).toEqual([ShowState.ENGLISH]);
    });

    it("parses multiple show params (gr+en)", () => {
      const url = new URL("https://example.com/?show=gr&show=en");
      const state = parseUrlState(url);
      expect(state.show).toContain(ShowState.GREEK);
      expect(state.show).toContain(ShowState.ENGLISH);
    });

    it("parses show=firstRead", () => {
      const url = new URL("https://example.com/?show=firstRead");
      const state = parseUrlState(url);
      expect(state.show).toEqual([ShowState.FIRST_READ]);
    });

    it("returns FIRST_READ when firstRead is in mixed params", () => {
      const url = new URL("https://example.com/?show=gr&show=firstRead");
      const state = parseUrlState(url);
      expect(state.show).toEqual([ShowState.FIRST_READ]);
    });

    it("ignores invalid show params", () => {
      const url = new URL("https://example.com/?show=invalid");
      const state = parseUrlState(url);
      expect(state.show).toEqual([ShowState.FIRST_READ]);
    });
  });

  describe("comment param", () => {
    it("parses single comment ID", () => {
      const url = new URL("https://example.com/?comment=en:note1");
      const state = parseUrlState(url);
      expect(state.comment).toEqual(["en:note1"]);
    });

    it("parses multiple comma-separated comment IDs", () => {
      const url = new URL("https://example.com/?comment=en:note1,gr:note2");
      const state = parseUrlState(url);
      expect(state.comment).toEqual(["en:note1", "gr:note2"]);
    });

    it("returns empty array when no comment param", () => {
      const url = new URL("https://example.com/");
      const state = parseUrlState(url);
      expect(state.comment).toEqual([]);
    });
  });

  describe("panel param", () => {
    it("parses panel=pinned", () => {
      const url = new URL("https://example.com/?panel=pinned");
      const state = parseUrlState(url);
      expect(state.panel).toBe("pinned");
    });

    it("returns null for other panel values", () => {
      const url = new URL("https://example.com/?panel=other");
      const state = parseUrlState(url);
      expect(state.panel).toBeNull();
    });

    it("returns null when no panel param", () => {
      const url = new URL("https://example.com/");
      const state = parseUrlState(url);
      expect(state.panel).toBeNull();
    });
  });

  describe("combined params", () => {
    it("parses all params together", () => {
      const url = new URL(
        "https://example.com/?ref=103a1&show=gr&show=en&comment=en:note1&panel=pinned"
      );
      const state = parseUrlState(url);
      expect(state.ref).toBe("103a1");
      expect(state.show).toContain(ShowState.GREEK);
      expect(state.show).toContain(ShowState.ENGLISH);
      expect(state.comment).toEqual(["en:note1"]);
      expect(state.panel).toBe("pinned");
    });
  });
});

describe("deriveShowState", () => {
  it("returns FIRST_READ when array contains FIRST_READ", () => {
    expect(deriveShowState([ShowState.FIRST_READ])).toBe(ShowState.FIRST_READ);
  });

  it("returns GREEK when only GREEK", () => {
    expect(deriveShowState([ShowState.GREEK])).toBe(ShowState.GREEK);
  });

  it("returns ENGLISH when only ENGLISH", () => {
    expect(deriveShowState([ShowState.ENGLISH])).toBe(ShowState.ENGLISH);
  });

  it("returns GREEK_AND_ENGLISH when both present", () => {
    expect(deriveShowState([ShowState.GREEK, ShowState.ENGLISH])).toBe(
      ShowState.GREEK_AND_ENGLISH
    );
  });

  it("returns FIRST_READ for empty array", () => {
    expect(deriveShowState([])).toBe(ShowState.FIRST_READ);
  });
});

describe("isShowActive", () => {
  const makeState = (show: ShowState[]): UrlState => ({
    ref: null,
    show,
    comment: [],
    panel: null,
  });

  describe("FIRST_READ", () => {
    it("returns true when FIRST_READ is in show", () => {
      const state = makeState([ShowState.FIRST_READ]);
      expect(isShowActive(state, ShowState.FIRST_READ)).toBe(true);
    });

    it("returns false when FIRST_READ is not in show", () => {
      const state = makeState([ShowState.GREEK]);
      expect(isShowActive(state, ShowState.FIRST_READ)).toBe(false);
    });
  });

  describe("GREEK", () => {
    it("returns true when GREEK is in show", () => {
      const state = makeState([ShowState.GREEK]);
      expect(isShowActive(state, ShowState.GREEK)).toBe(true);
    });

    it("returns true when GREEK is in show with ENGLISH", () => {
      const state = makeState([ShowState.GREEK, ShowState.ENGLISH]);
      expect(isShowActive(state, ShowState.GREEK)).toBe(true);
    });

    it("returns false when only ENGLISH", () => {
      const state = makeState([ShowState.ENGLISH]);
      expect(isShowActive(state, ShowState.GREEK)).toBe(false);
    });
  });

  describe("ENGLISH", () => {
    it("returns true when ENGLISH is in show", () => {
      const state = makeState([ShowState.ENGLISH]);
      expect(isShowActive(state, ShowState.ENGLISH)).toBe(true);
    });

    it("returns true when ENGLISH is in show with GREEK", () => {
      const state = makeState([ShowState.GREEK, ShowState.ENGLISH]);
      expect(isShowActive(state, ShowState.ENGLISH)).toBe(true);
    });

    it("returns false when only GREEK", () => {
      const state = makeState([ShowState.GREEK]);
      expect(isShowActive(state, ShowState.ENGLISH)).toBe(false);
    });
  });

  describe("GREEK_AND_ENGLISH", () => {
    it("returns true when both GREEK and ENGLISH are in show", () => {
      const state = makeState([ShowState.GREEK, ShowState.ENGLISH]);
      expect(isShowActive(state, ShowState.GREEK_AND_ENGLISH)).toBe(true);
    });

    it("returns false when only GREEK", () => {
      const state = makeState([ShowState.GREEK]);
      expect(isShowActive(state, ShowState.GREEK_AND_ENGLISH)).toBe(false);
    });

    it("returns false when only ENGLISH", () => {
      const state = makeState([ShowState.ENGLISH]);
      expect(isShowActive(state, ShowState.GREEK_AND_ENGLISH)).toBe(false);
    });
  });
});
