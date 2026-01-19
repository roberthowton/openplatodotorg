import { describe, it, expect } from "vitest";
import { buildUrl } from "../actions";
import { ShowState } from "../../../types";
import type { UrlState } from "../types";

describe("buildUrl", () => {
  const baseUrl = new URL("https://example.com/dialogue/meno");

  const defaultState: UrlState = {
    ref: null,
    show: [ShowState.FIRST_READ],
    comment: [],
    panel: null,
  };

  describe("ref param", () => {
    it("adds ref param when set", () => {
      const state = { ...defaultState, ref: "103a1" };
      const url = buildUrl(baseUrl, state);
      expect(url.searchParams.get("ref")).toBe("103a1");
    });

    it("omits ref param when null", () => {
      const url = buildUrl(baseUrl, defaultState);
      expect(url.searchParams.has("ref")).toBe(false);
    });
  });

  describe("show params", () => {
    it("adds show=firstRead when in first read mode", () => {
      const url = buildUrl(baseUrl, defaultState);
      expect(url.searchParams.getAll("show")).toEqual(["firstRead"]);
    });

    it("adds single show param for GREEK", () => {
      const state = { ...defaultState, show: [ShowState.GREEK] };
      const url = buildUrl(baseUrl, state);
      expect(url.searchParams.getAll("show")).toEqual(["gr"]);
    });

    it("adds single show param for ENGLISH", () => {
      const state = { ...defaultState, show: [ShowState.ENGLISH] };
      const url = buildUrl(baseUrl, state);
      expect(url.searchParams.getAll("show")).toEqual(["en"]);
    });

    it("adds multiple show params for both languages", () => {
      const state = {
        ...defaultState,
        show: [ShowState.GREEK, ShowState.ENGLISH],
      };
      const url = buildUrl(baseUrl, state);
      const showParams = url.searchParams.getAll("show");
      expect(showParams).toContain("gr");
      expect(showParams).toContain("en");
      expect(showParams).toHaveLength(2);
    });
  });

  describe("comment param", () => {
    it("adds single comment as param", () => {
      const state = { ...defaultState, comment: ["en:note1"] };
      const url = buildUrl(baseUrl, state);
      expect(url.searchParams.get("comment")).toBe("en:note1");
    });

    it("joins multiple comments with comma", () => {
      const state = { ...defaultState, comment: ["en:note1", "gr:note2"] };
      const url = buildUrl(baseUrl, state);
      expect(url.searchParams.get("comment")).toBe("en:note1,gr:note2");
    });

    it("omits comment param when empty", () => {
      const url = buildUrl(baseUrl, defaultState);
      expect(url.searchParams.has("comment")).toBe(false);
    });
  });

  describe("panel param", () => {
    it("adds panel=pinned when pinned", () => {
      const state = { ...defaultState, panel: "pinned" as const };
      const url = buildUrl(baseUrl, state);
      expect(url.searchParams.get("panel")).toBe("pinned");
    });

    it("omits panel param when null", () => {
      const url = buildUrl(baseUrl, defaultState);
      expect(url.searchParams.has("panel")).toBe(false);
    });
  });

  describe("combined state", () => {
    it("builds URL with all params", () => {
      const state: UrlState = {
        ref: "103a1",
        show: [ShowState.GREEK, ShowState.ENGLISH],
        comment: ["en:note1"],
        panel: "pinned",
      };
      const url = buildUrl(baseUrl, state);

      expect(url.searchParams.get("ref")).toBe("103a1");
      expect(url.searchParams.getAll("show")).toContain("gr");
      expect(url.searchParams.getAll("show")).toContain("en");
      expect(url.searchParams.get("comment")).toBe("en:note1");
      expect(url.searchParams.get("panel")).toBe("pinned");
    });

    it("preserves base URL path", () => {
      const state = { ...defaultState, ref: "103a1" };
      const url = buildUrl(baseUrl, state);
      expect(url.pathname).toBe("/dialogue/meno");
    });

    it("preserves base URL origin", () => {
      const state = { ...defaultState, ref: "103a1" };
      const url = buildUrl(baseUrl, state);
      expect(url.origin).toBe("https://example.com");
    });
  });

  describe("clearing existing params", () => {
    it("replaces existing state params from base URL", () => {
      const urlWithParams = new URL(
        "https://example.com/dialogue/meno?ref=old&show=gr&comment=old:note&panel=pinned"
      );
      const state: UrlState = {
        ref: null,
        show: [ShowState.FIRST_READ],
        comment: [],
        panel: null,
      };
      const url = buildUrl(urlWithParams, state);

      expect(url.searchParams.has("ref")).toBe(false);
      expect(url.searchParams.getAll("show")).toEqual(["firstRead"]);
      expect(url.searchParams.has("comment")).toBe(false);
      expect(url.searchParams.has("panel")).toBe(false);
    });

    it("replaces existing params with new values", () => {
      const urlWithParams = new URL(
        "https://example.com/dialogue/meno?ref=old&show=en"
      );
      const state: UrlState = {
        ref: "new",
        show: [ShowState.GREEK],
        comment: [],
        panel: null,
      };
      const url = buildUrl(urlWithParams, state);

      expect(url.searchParams.get("ref")).toBe("new");
      expect(url.searchParams.getAll("show")).toEqual(["gr"]);
    });
  });
});
