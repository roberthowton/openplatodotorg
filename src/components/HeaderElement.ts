import { dispatch } from "../state/url";
import { ShowState } from "../types";

export function createHeaderElement(): typeof HTMLElement {
  return class SiteHeaderElement extends HTMLElement {
    private controller: AbortController | null = null;

    connectedCallback() {
      if (this.controller) this.controller.abort();
      this.controller = new AbortController();
      const { signal } = this.controller;

      // Mode toggle
      this.querySelectorAll(".mode-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const mode = (btn as HTMLElement).dataset.mode;
          if (mode === "firstRead") {
            dispatch({ type: "SET_FIRST_READ" });
          } else {
            dispatch({ type: "EXIT_FIRST_READ" });
          }
        }, { signal });
      });

      // Mobile language toggle
      this.querySelectorAll(".lang-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const lang = (btn as HTMLElement).dataset.lang;
          if (lang === "gr") {
            dispatch({ type: "SET_SHOW", payload: [ShowState.GREEK] });
          } else {
            dispatch({ type: "SET_SHOW", payload: [ShowState.ENGLISH] });
          }
        }, { signal });
      });

      // Theme toggle — dual radio buttons
      const html = document.documentElement;
      const themeBtns = this.querySelectorAll(".theme-btn");

      const updateThemeButtons = (theme: string) => {
        themeBtns.forEach((btn) => {
          const option = (btn as HTMLElement).dataset.themeOption;
          btn.classList.toggle("active", option === theme);
        });
      };

      // Sync with current theme on connect
      updateThemeButtons(html.dataset.theme || "light");

      themeBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const newTheme = (btn as HTMLElement).dataset.themeOption || "light";
          html.dataset.theme = newTheme;
          localStorage.setItem("theme", newTheme);
          updateThemeButtons(newTheme);
        }, { signal });
      });
    }

    disconnectedCallback() {
      this.controller?.abort();
    }
  };
}
