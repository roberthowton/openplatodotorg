// Extracted Tei custom element logic for testing
import { customBehaviors } from "../utils";
import CETEI from "CETEIcean";
import { injectAnchors, type AnchorIndex } from "../scripts/injectAnchors";
import { annotate } from "../scripts/annotate";

export interface TeiElementConfig {
  rootId?: string;
  useBehaviors: boolean;
  elements: string[];
  language?: "en" | "gr";
}

// Store anchor indices globally for access by annotation layer
export const anchorIndices: Map<string, AnchorIndex> = new Map();

export function applyTeiConfig(element: HTMLElement, config: TeiElementConfig): void {
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
        anchorIndices.set(lang, anchorIndex);

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
        document.addEventListener("DOMContentLoaded", doInject);
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
    connectedCallback() {
      const config = parseDatasetConfig(this.dataset);
      applyTeiConfig(this, config);
    }
  };
}
