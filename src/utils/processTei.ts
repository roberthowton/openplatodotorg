// Source: https://github.com/raffazizzi/astro-tei/blob/bfb46d2dce80abf31cab174aae78b0cc401701b9/packages/core/src/processTei.ts
import CETEI from "CETEIcean";
import { JSDOM } from "jsdom";

export interface ProcessedTei {
  dom: Document;
  serialized: string;
  elements: string[];
}

const processTei = (data: string): ProcessedTei => {
  const jdom = new JSDOM(data, { contentType: "text/xml" });
  const teiDoc = jdom.window.document;

  const ceteicean = new CETEI({
    documentObject: teiDoc,
  });

  const teiData = ceteicean.preprocess(teiDoc);
  teiData.firstElementChild.setAttribute(
    "data-elements",
    Array.from(ceteicean.els).join(","),
  );

  // Replace input JSDOM tree with new tree so that we can use the JSDOM native serialize method.
  teiDoc.documentElement.replaceWith(teiData);

  return {
    dom: teiDoc,
    serialized: jdom.serialize(),
    elements: Array.from(ceteicean.els) as string[],
  };
};

export { processTei as default, processTei };
