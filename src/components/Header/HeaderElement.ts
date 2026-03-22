import { dispatch } from "../../state/url";
import { ShowState } from "../../types";

export function createHeaderElement(): typeof HTMLElement {
  return class SiteHeaderElement extends HTMLElement {
    private controller: AbortController | null = null;

    connectedCallback() {
      if (this.controller) this.controller.abort();
      this.controller = new AbortController();
      const { signal } = this.controller;

      // Mode toggle
      this.querySelectorAll("[data-toggle-name='mode'] [data-value]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const value = (btn as HTMLElement).dataset.value;
          if (value === "firstRead") {
            dispatch({ type: "SET_FIRST_READ" });
          } else {
            dispatch({ type: "EXIT_FIRST_READ" });
          }
        }, { signal });
      });

      // Mobile language toggle
      this.querySelectorAll("[data-toggle-name='lang'] [data-value]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const value = (btn as HTMLElement).dataset.value;
          if (value === "gr") {
            dispatch({ type: "SET_SHOW", payload: [ShowState.GREEK] });
          } else {
            dispatch({ type: "SET_SHOW", payload: [ShowState.ENGLISH] });
          }
        }, { signal });
      });

      // Theme toggle — dual radio buttons
      const html = document.documentElement;
      const themeBtns = this.querySelectorAll("[data-toggle-name='theme'] [data-value]");

      const updateThemeButtons = (theme: string) => {
        themeBtns.forEach((btn) => {
          const option = (btn as HTMLElement).dataset.value;
          btn.classList.toggle("active", option === theme);
        });
      };

      // Sync with current theme on connect
      updateThemeButtons(html.dataset.theme || "light");

      themeBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const newTheme = (btn as HTMLElement).dataset.value || "light";
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
