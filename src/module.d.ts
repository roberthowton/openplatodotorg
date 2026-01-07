declare module "CETEIcean";

declare global {
  namespace astroHTML.JSX {
    interface IntrinsicElements {
      "show-button": {
        "data-show"?: string;
        class?: string;
        children?: any;
      };
      "tei-container": {
        "set:html"?: string;
        "data-root-id"?: string;
        "data-usebehaviors"?: string;
        "data-elements"?: string;
        style?: string;
        [key: string]: any;
      };
    }
  }
}
