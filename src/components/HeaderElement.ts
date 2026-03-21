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

      // Theme toggle — init (FOUC prevention) is in head.astro; only click handler here
      const themeToggle = this.querySelector("[data-theme-toggle]");
      const html = document.documentElement;

      const updateThemeLabel = (theme: string) => {
        const label = this.querySelector(".theme-label");
        if (label) {
          label.textContent = theme === "dark" ? "DARK MODE" : "LIGHT MODE";
        }
      };

      // Sync label with current theme on connect
      updateThemeLabel(html.dataset.theme || "light");

      // Search toggle
      const searchBtn = this.querySelector("[data-search-btn]");
      searchBtn?.addEventListener("click", () => {
        document.dispatchEvent(new CustomEvent("search-toggle"));
      }, { signal });

      themeToggle?.addEventListener("click", () => {
        const newTheme = html.dataset.theme === "dark" ? "light" : "dark";
        html.dataset.theme = newTheme;
        localStorage.setItem("theme", newTheme);
        updateThemeLabel(newTheme);
      }, { signal });
    }

    disconnectedCallback() {
      this.controller?.abort();
    }
  };
}
