// Extracted Tei custom element logic for testing
import { customBehaviors } from "../utils";
import CETEI from "CETEIcean";

export interface TeiElementConfig {
  rootId?: string;
  useBehaviors: boolean;
  elements: string[];
}

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
  }

  element.style.display = "block";
}

export function parseDatasetConfig(dataset: DOMStringMap): TeiElementConfig {
  return {
    rootId: dataset.rootId,
    useBehaviors: dataset.usebehaviors === "true",
    elements: dataset.elements?.split(",") || [],
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
