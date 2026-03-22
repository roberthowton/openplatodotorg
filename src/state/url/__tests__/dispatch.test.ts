import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }));
vi.mock("astro:transitions/client", () => ({ navigate: mockNavigate }));

import { dispatch, dispatchAll } from "../dispatch";

function mockLocation(href: string) {
  Object.defineProperty(window, "location", {
    value: { href },
    writable: true,
    configurable: true,
  });
}

let replaceStateSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  mockNavigate.mockClear();
  replaceStateSpy = vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
  replaceStateSpy.mockClear();
  mockLocation("https://example.com/dialogue/meno");
});

afterEach(() => {
  replaceStateSpy.mockRestore();
});

describe("dispatch", () => {
  it("does nothing when state is unchanged", () => {
    dispatch({ type: "SET_REF", payload: null });
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(replaceStateSpy).not.toHaveBeenCalled();
  });

  it("uses hard navigation for SET_SHOW", () => {
    dispatch({ type: "SET_SHOW", payload: ["gr"] as any });
    expect(mockNavigate).toHaveBeenCalled();
    expect(replaceStateSpy).not.toHaveBeenCalled();
  });

  it("uses hard navigation for SET_FIRST_READ", () => {
    mockLocation("https://example.com/dialogue/meno?show=gr");
    dispatch({ type: "SET_FIRST_READ" });
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("uses hard navigation for EXIT_FIRST_READ", () => {
    dispatch({ type: "EXIT_FIRST_READ" });
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("uses soft navigation for SET_REF", () => {
    dispatch({ type: "SET_REF", payload: "73a1" });
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(replaceStateSpy).toHaveBeenCalled();
  });

  it("uses soft navigation for PIN_PANEL", () => {
    dispatch({ type: "PIN_PANEL" });
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(replaceStateSpy).toHaveBeenCalled();
  });

  it("new URL contains updated param", () => {
    dispatch({ type: "SET_REF", payload: "73a1" });
    const url = replaceStateSpy.mock.calls[0][2] as string;
    expect(url).toContain("ref=73a1");
  });
});

describe("dispatchAll", () => {
  it("applies multiple actions and uses soft nav when no hard-nav actions", () => {
    dispatchAll([
      { type: "SET_REF", payload: "73a1" },
      { type: "PIN_PANEL" },
    ]);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(replaceStateSpy).toHaveBeenCalled();
  });

  it("uses hard nav when any action is a hard-nav action", () => {
    dispatchAll([
      { type: "SET_REF", payload: "73a1" },
      { type: "SET_SHOW", payload: ["gr"] as any },
    ]);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("URL reflects all batched changes", () => {
    dispatchAll([
      { type: "SET_REF", payload: "73a1" },
      { type: "PIN_PANEL" },
    ]);
    const url = replaceStateSpy.mock.calls[0][2] as string;
    expect(url).toContain("ref=73a1");
    expect(url).toContain("panel=pinned");
  });
});
