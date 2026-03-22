import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockDispatch } = vi.hoisted(() => ({ mockDispatch: vi.fn() }));
vi.mock("../../state/url", () => ({ dispatch: mockDispatch }));
vi.mock("astro:transitions/client", () => ({ navigate: vi.fn() }));

import { createHeaderElement } from "../Header/HeaderElement";

function buildHeader(html: string): HTMLElement {
  const el = document.createElement("site-header");
  el.innerHTML = html;
  return el;
}

describe("createHeaderElement", () => {
  let SiteHeaderElement: ReturnType<typeof createHeaderElement>;

  beforeEach(() => {
    mockDispatch.mockClear();
    SiteHeaderElement = createHeaderElement();
    document.body.innerHTML = "";
  });

  describe("mode toggle", () => {
    it("dispatches SET_FIRST_READ on firstRead button click", () => {
      const el = buildHeader(`
        <div data-toggle-name="mode">
          <button data-value="firstRead">First Read</button>
          <button data-value="standard">Standard</button>
        </div>
      `);
      document.body.appendChild(el);
      Object.setPrototypeOf(el, SiteHeaderElement.prototype);
      (el as any).connectedCallback();

      el.querySelector<HTMLElement>('[data-value="firstRead"]')!.click();
      expect(mockDispatch).toHaveBeenCalledWith({ type: "SET_FIRST_READ" });
    });

    it("dispatches EXIT_FIRST_READ on non-firstRead button click", () => {
      const el = buildHeader(`
        <div data-toggle-name="mode">
          <button data-value="standard">Standard</button>
        </div>
      `);
      document.body.appendChild(el);
      Object.setPrototypeOf(el, SiteHeaderElement.prototype);
      (el as any).connectedCallback();

      el.querySelector<HTMLElement>('[data-value="standard"]')!.click();
      expect(mockDispatch).toHaveBeenCalledWith({ type: "EXIT_FIRST_READ" });
    });
  });

  describe("language toggle", () => {
    it("dispatches SET_SHOW with GREEK on gr button click", () => {
      const el = buildHeader(`
        <div data-toggle-name="lang">
          <button data-value="gr">Greek</button>
        </div>
      `);
      document.body.appendChild(el);
      Object.setPrototypeOf(el, SiteHeaderElement.prototype);
      (el as any).connectedCallback();

      el.querySelector<HTMLElement>('[data-value="gr"]')!.click();
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "SET_SHOW",
        payload: expect.arrayContaining(["gr"]),
      });
    });

    it("dispatches SET_SHOW with ENGLISH on en button click", () => {
      const el = buildHeader(`
        <div data-toggle-name="lang">
          <button data-value="en">English</button>
        </div>
      `);
      document.body.appendChild(el);
      Object.setPrototypeOf(el, SiteHeaderElement.prototype);
      (el as any).connectedCallback();

      el.querySelector<HTMLElement>('[data-value="en"]')!.click();
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "SET_SHOW",
        payload: expect.arrayContaining(["en"]),
      });
    });
  });

  describe("theme toggle", () => {
    it("sets data-theme and localStorage on theme button click", () => {
      const html = document.documentElement;
      html.dataset.theme = "light";
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

      const el = buildHeader(`
        <div data-toggle-name="theme">
          <button data-value="dark">Dark</button>
          <button data-value="light">Light</button>
        </div>
      `);
      document.body.appendChild(el);
      Object.setPrototypeOf(el, SiteHeaderElement.prototype);
      (el as any).connectedCallback();

      el.querySelector<HTMLElement>('[data-value="dark"]')!.click();
      expect(html.dataset.theme).toBe("dark");
      expect(setItemSpy).toHaveBeenCalledWith("theme", "dark");
    });

    it("syncs active class to current theme on connect", () => {
      const html = document.documentElement;
      html.dataset.theme = "dark";

      const el = buildHeader(`
        <div data-toggle-name="theme">
          <button data-value="dark">Dark</button>
          <button data-value="light">Light</button>
        </div>
      `);
      document.body.appendChild(el);
      Object.setPrototypeOf(el, SiteHeaderElement.prototype);
      (el as any).connectedCallback();

      const darkBtn = el.querySelector<HTMLElement>('[data-value="dark"]')!;
      const lightBtn = el.querySelector<HTMLElement>('[data-value="light"]')!;
      expect(darkBtn.classList.contains("active")).toBe(true);
      expect(lightBtn.classList.contains("active")).toBe(false);
    });
  });

  describe("disconnectedCallback", () => {
    it("aborts the controller on disconnect", () => {
      const el = buildHeader(`<div data-toggle-name="mode"></div>`);
      document.body.appendChild(el);
      Object.setPrototypeOf(el, SiteHeaderElement.prototype);
      (el as any).connectedCallback();

      const controller = (el as any).controller as AbortController;
      const abortSpy = vi.spyOn(controller, "abort");
      (el as any).disconnectedCallback();
      expect(abortSpy).toHaveBeenCalled();
    });
  });
});
