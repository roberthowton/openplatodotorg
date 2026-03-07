// Extracted Tei custom element logic for testing
import { customBehaviors } from "../utils";
import CETEI from "CETEIcean";
import { injectAnchors } from "../scripts/injectAnchors";
import { annotate } from "../scripts/annotate";

export interface TeiElementConfig {
  rootId?: string;
  useBehaviors: boolean;
  elements: string[];
  language?: "en" | "gr";
}

export function applyTeiConfig(element: HTMLElement, config: TeiElementConfig, signal?: AbortSignal): void {
  if (config.rootId) {
    element.id = config.rootId;
  }

  const teiDom = element.firstChild as HTMLElement;

  if (config.useBehaviors && teiDom) {
    const ceteicean = new CETEI();
    ceteicean.addBehaviors({
      tei: {
        ...customBehaviors,
      },
    });
    ceteicean.els = config.elements;
    ceteicean.utilities.dom = teiDom;
    ceteicean.applyBehaviors();

    // Inject anchors after behaviors are applied (defer until DOM ready)
    if (config.language) {
      const lang = config.language;
      const doInject = () => {
        const anchorIndex = injectAnchors(element, lang);

        // Apply annotations (segment decomposition)
        annotate(element, lang, anchorIndex);

        // Dispatch event for UI layer
        element.dispatchEvent(
          new CustomEvent("tei-annotations-ready", {
            detail: { language: lang, anchorIndex },
            bubbles: true,
          })
        );
      };

      // Defer until full document is parsed (comments JSON may come after tei-container)
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", doInject, { signal, once: true });
      } else {
        doInject();
      }
    }
  }

  element.style.display = "block";
}

export function parseDatasetConfig(dataset: DOMStringMap): TeiElementConfig {
  return {
    rootId: dataset.rootId,
    useBehaviors: dataset.usebehaviors === "true",
    elements: dataset.elements?.split(",") || [],
    language: dataset.language as "en" | "gr" | undefined,
  };
}

export function createTeiCustomElement(): typeof HTMLElement {
  return class TeiContainer extends HTMLElement {
    private controller: AbortController | null = null;

    connectedCallback() {
      if (this.controller) this.controller.abort();
      this.controller = new AbortController();
      const config = parseDatasetConfig(this.dataset);
      applyTeiConfig(this, config, this.controller.signal);
    }

    disconnectedCallback() {
      this.controller?.abort();
    }
  };
}
