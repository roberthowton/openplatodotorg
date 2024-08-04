import type { CollectionEntry } from "astro:content";
import type { FC } from "react";
import { $showState } from "../stores/show-state";
import { ShowState } from "../types";
import { useStore } from "@nanostores/react";

type DialogContainerProps = {
  greekText: CollectionEntry<"dialogV2">;
  englishText: CollectionEntry<"dialogV2">;
};

type DialogText = CollectionEntry<"dialogV2">["data"];

const DialogV2Container: FC<DialogContainerProps> = ({
  greekText,
  englishText,
}) => {
  const showState = useStore($showState);

  const greekStyle = showState === ShowState.ENGLISH ? { display: "none" } : {};
  const englishStyle = showState === "greek" ? { display: "none" } : {};

  const getStephanusAnnotation = (
    page: string,
    column: string,
    lineNum: string,
  ) => {
    if (column === "a" && lineNum === "1") {
      return page;
    }

    if (lineNum === "1") {
      return column;
    }

    if (Number(lineNum) % 5 === 0) {
      return lineNum;
    }
  };

  return (
    <>
      <section style={{ ...greekStyle, lineHeight: "1.5rem" }} id="greek">
        {Object.entries(greekText.data).map(
          ([stephanusPage, stephanusColumnsObj]) => (
            <div key={stephanusPage}>
              {Object.entries(stephanusColumnsObj).map(
                ([stephanusColumn, lineObj]) => (
                  <div key={`${stephanusPage}${stephanusColumn}`} style={{}}>
                    {Object.entries(lineObj).map(([lineNum, lineText]) => (
                      <div
                        key={`${stephanusPage}${stephanusColumn}${lineNum}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 9fr",
                          columnGap: ".75rem",
                        }}
                      >
                        <div style={{ justifySelf: "flex-end" }}>
                          {getStephanusAnnotation(
                            stephanusPage,
                            stephanusColumn,
                            lineNum,
                          )}
                        </div>
                        <div>{lineText}</div>
                      </div>
                    ))}
                  </div>
                ),
              )}
            </div>
          ),
        )}
      </section>
      <section id="english" style={englishStyle}></section>
    </>
  );
};

export default DialogV2Container;
