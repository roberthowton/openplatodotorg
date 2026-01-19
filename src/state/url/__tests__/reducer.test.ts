import { describe, it, expect } from "vitest";
import { urlReducer } from "../reducer";
import { ShowState } from "../../../types";
import type { UrlState } from "../types";

const defaultState: UrlState = {
  ref: null,
  show: [ShowState.FIRST_READ],
  comment: [],
  panel: null,
};

describe("urlReducer", () => {
  describe("SET_REF", () => {
    it("sets ref value", () => {
      const result = urlReducer(defaultState, {
        type: "SET_REF",
        payload: "103a1",
      });
      expect(result.ref).toBe("103a1");
    });

    it("clears ref with null", () => {
      const state = { ...defaultState, ref: "103a1" };
      const result = urlReducer(state, { type: "SET_REF", payload: null });
      expect(result.ref).toBeNull();
    });

    it("preserves other state", () => {
      const state: UrlState = {
        ref: null,
        show: [ShowState.GREEK],
        comment: ["en:note1"],
        panel: "pinned",
      };
      const result = urlReducer(state, { type: "SET_REF", payload: "103a1" });
      expect(result.show).toEqual([ShowState.GREEK]);
      expect(result.comment).toEqual(["en:note1"]);
      expect(result.panel).toBe("pinned");
    });
  });

  describe("SET_SHOW", () => {
    it("sets show array", () => {
      const result = urlReducer(defaultState, {
        type: "SET_SHOW",
        payload: [ShowState.GREEK, ShowState.ENGLISH],
      });
      expect(result.show).toEqual([ShowState.GREEK, ShowState.ENGLISH]);
    });

    it("replaces existing show", () => {
      const state = { ...defaultState, show: [ShowState.GREEK] };
      const result = urlReducer(state, {
        type: "SET_SHOW",
        payload: [ShowState.ENGLISH],
      });
      expect(result.show).toEqual([ShowState.ENGLISH]);
    });
  });

  describe("TOGGLE_SHOW", () => {
    describe("toggling FIRST_READ", () => {
      it("exits first read to show both languages", () => {
        const state = { ...defaultState, show: [ShowState.FIRST_READ] };
        const result = urlReducer(state, {
          type: "TOGGLE_SHOW",
          payload: ShowState.FIRST_READ,
        });
        expect(result.show).toContain(ShowState.GREEK);
        expect(result.show).toContain(ShowState.ENGLISH);
      });

      it("enters first read from languages", () => {
        const state = { ...defaultState, show: [ShowState.GREEK] };
        const result = urlReducer(state, {
          type: "TOGGLE_SHOW",
          payload: ShowState.FIRST_READ,
        });
        expect(result.show).toEqual([ShowState.FIRST_READ]);
      });
    });

    describe("toggling languages", () => {
      it("cannot toggle language while in first read", () => {
        const state = { ...defaultState, show: [ShowState.FIRST_READ] };
        const result = urlReducer(state, {
          type: "TOGGLE_SHOW",
          payload: ShowState.GREEK,
        });
        expect(result.show).toEqual([ShowState.FIRST_READ]);
      });

      it("removes language when present", () => {
        const state = {
          ...defaultState,
          show: [ShowState.GREEK, ShowState.ENGLISH],
        };
        const result = urlReducer(state, {
          type: "TOGGLE_SHOW",
          payload: ShowState.GREEK,
        });
        expect(result.show).toEqual([ShowState.ENGLISH]);
      });

      it("adds language when not present", () => {
        const state = { ...defaultState, show: [ShowState.GREEK] };
        const result = urlReducer(state, {
          type: "TOGGLE_SHOW",
          payload: ShowState.ENGLISH,
        });
        expect(result.show).toContain(ShowState.GREEK);
        expect(result.show).toContain(ShowState.ENGLISH);
      });

      it("returns to first read when removing last language", () => {
        const state = { ...defaultState, show: [ShowState.GREEK] };
        const result = urlReducer(state, {
          type: "TOGGLE_SHOW",
          payload: ShowState.GREEK,
        });
        expect(result.show).toEqual([ShowState.FIRST_READ]);
      });
    });
  });

  describe("SET_FIRST_READ", () => {
    it("sets show to first read", () => {
      const state = {
        ...defaultState,
        show: [ShowState.GREEK, ShowState.ENGLISH],
      };
      const result = urlReducer(state, { type: "SET_FIRST_READ" });
      expect(result.show).toEqual([ShowState.FIRST_READ]);
    });
  });

  describe("EXIT_FIRST_READ", () => {
    it("sets show to both languages", () => {
      const state = { ...defaultState, show: [ShowState.FIRST_READ] };
      const result = urlReducer(state, { type: "EXIT_FIRST_READ" });
      expect(result.show).toContain(ShowState.GREEK);
      expect(result.show).toContain(ShowState.ENGLISH);
    });
  });

  describe("SET_COMMENT", () => {
    it("sets comment array", () => {
      const result = urlReducer(defaultState, {
        type: "SET_COMMENT",
        payload: ["en:note1", "gr:note2"],
      });
      expect(result.comment).toEqual(["en:note1", "gr:note2"]);
    });

    it("replaces existing comments", () => {
      const state = { ...defaultState, comment: ["en:note1"] };
      const result = urlReducer(state, {
        type: "SET_COMMENT",
        payload: ["gr:note2"],
      });
      expect(result.comment).toEqual(["gr:note2"]);
    });
  });

  describe("ADD_COMMENT", () => {
    it("adds comment to empty array", () => {
      const result = urlReducer(defaultState, {
        type: "ADD_COMMENT",
        payload: "en:note1",
      });
      expect(result.comment).toEqual(["en:note1"]);
    });

    it("adds comment to existing array", () => {
      const state = { ...defaultState, comment: ["en:note1"] };
      const result = urlReducer(state, {
        type: "ADD_COMMENT",
        payload: "gr:note2",
      });
      expect(result.comment).toEqual(["en:note1", "gr:note2"]);
    });

    it("does not add duplicate comment", () => {
      const state = { ...defaultState, comment: ["en:note1"] };
      const result = urlReducer(state, {
        type: "ADD_COMMENT",
        payload: "en:note1",
      });
      expect(result.comment).toEqual(["en:note1"]);
      expect(result).toBe(state); // Same reference
    });
  });

  describe("CLEAR_COMMENT", () => {
    it("clears all comments", () => {
      const state = { ...defaultState, comment: ["en:note1", "gr:note2"] };
      const result = urlReducer(state, { type: "CLEAR_COMMENT" });
      expect(result.comment).toEqual([]);
    });
  });

  describe("PIN_PANEL", () => {
    it("sets panel to pinned", () => {
      const result = urlReducer(defaultState, { type: "PIN_PANEL" });
      expect(result.panel).toBe("pinned");
    });
  });

  describe("UNPIN_PANEL", () => {
    it("sets panel to null", () => {
      const state = { ...defaultState, panel: "pinned" as const };
      const result = urlReducer(state, { type: "UNPIN_PANEL" });
      expect(result.panel).toBeNull();
    });
  });

  describe("TOGGLE_PIN", () => {
    it("pins when unpinned", () => {
      const result = urlReducer(defaultState, { type: "TOGGLE_PIN" });
      expect(result.panel).toBe("pinned");
    });

    it("unpins when pinned", () => {
      const state = { ...defaultState, panel: "pinned" as const };
      const result = urlReducer(state, { type: "TOGGLE_PIN" });
      expect(result.panel).toBeNull();
    });
  });

  describe("immutability", () => {
    it("does not mutate original state", () => {
      const original: UrlState = {
        ref: "103a1",
        show: [ShowState.GREEK],
        comment: ["en:note1"],
        panel: "pinned",
      };
      const frozen = Object.freeze({ ...original });

      urlReducer(frozen, { type: "SET_REF", payload: "104b2" });
      urlReducer(frozen, { type: "SET_SHOW", payload: [ShowState.ENGLISH] });
      urlReducer(frozen, { type: "SET_COMMENT", payload: [] });
      urlReducer(frozen, { type: "UNPIN_PANEL" });

      // If we got here without errors, state wasn't mutated
      expect(frozen.ref).toBe("103a1");
      expect(frozen.show).toEqual([ShowState.GREEK]);
      expect(frozen.comment).toEqual(["en:note1"]);
      expect(frozen.panel).toBe("pinned");
    });
  });
});
