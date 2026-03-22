// Source: https://github.com/raffazizzi/astro-tei/blob/bfb46d2dce80abf31cab174aae78b0cc401701b9/packages/core/src/processTei.ts
import CETEI from "CETEIcean";
import { JSDOM } from "jsdom";
import { createBehaviors } from ".";

export interface ProcessedTei {
  dom: Document;
  serialized: string;
  elements: string[];
}

const processTei = (data: string, language: "en" | "gr" = "gr"): ProcessedTei => {
  // Parse the TEI XML
  const xmlJdom = new JSDOM(data, { contentType: "text/xml" });
  const xmlDoc = xmlJdom.window.document;

  // Use an HTML JSDOM as the element factory so that preprocess() creates
  // HTMLElement nodes (which have .style). An XML document produces plain
  // Element nodes without CSS style support.
  const htmlJdom = new JSDOM("");
  const htmlDoc = htmlJdom.window.document;

  const ceteicean = new CETEI({ documentObject: htmlDoc });

  ceteicean.addBehaviors({
    tei: createBehaviors(language),
  });

  const teiData = ceteicean.preprocess(xmlDoc);
  teiData.firstElementChild.setAttribute(
    "data-elements",
    Array.from(ceteicean.els).join(","),
  );

  // Apply behaviors server-side. We call fallback() directly rather than
  // applyBehaviors() because applyBehaviors() checks for window.customElements
  // and takes the define() path in jsdom/test environments, which does not fire
  // on elements in an isolated JSDOM instance.
  (ceteicean as any).fallback(Array.from(ceteicean.els));

  // Move processed fragment into the HTML document for serialization and DOM queries.
  htmlDoc.body.appendChild(teiData);

  return {
    dom: htmlDoc,
    serialized: htmlDoc.body.innerHTML,
    elements: Array.from(ceteicean.els) as string[],
  };
};

export { processTei as default, processTei };
