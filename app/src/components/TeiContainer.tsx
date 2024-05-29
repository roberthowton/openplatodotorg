import type { FC } from "react";
import BasicRouter, { DefaultBehaviors, type IRoutes } from "@astro-tei/react";

interface TeiContainerProps {
  doc: Document;
  data: string;
  elements: string[];
}

const TeiContainer: FC<TeiContainerProps> = ({ doc, data, elements }) => {
  const { Tei, Eg, Graphic, List, Note, Ptr, Ref, TeiHeader } =
    DefaultBehaviors;

  // console.log({ doc, data, elements });

  const routes: IRoutes = {
    "tei-tei": Tei,
    "teieg-egxml": Eg,
    "tei-graphic": Graphic,
    "tei-list": List,
    "tei-note": Note,
    "tei-ptr": Ptr,
    "tei-ref": Ref,
    "tei-teiheader": TeiHeader,
  };

  return <BasicRouter doc={doc} elements={elements} routes={routes} />;
};

export default TeiContainer;
