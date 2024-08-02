import type { CollectionEntry } from "astro:content";
import type { FC } from "react";
import { $showState } from "../stores/show-state";
import { ShowState } from "../types";
import { useStore } from "@nanostores/react";

type DialogContainerProps = {
  greekText: CollectionEntry<"dialogs">;
  englishText: CollectionEntry<"dialogs">;
};

const DialogContainer: FC<DialogContainerProps> = ({
  greekText,
  englishText,
}) => {
  const showState = useStore($showState);

  const greekStyle = showState === ShowState.ENGLISH ? { display: "none" } : {};
  const englishStyle = showState === "greek" ? { display: "none" } : {};

  return (
    <>
      <div style={greekStyle} id="greek">
        {Object.entries(greekText.data).map(([key, value]) => (
          <article key={key} id={key}>
            {Object.entries(value).map(([key, value]) => (
              <section key={key} className={key}>
                {value.replace(/\`/g, "")}
              </section>
            ))}
          </article>
        ))}
      </div>
      <div id="english" style={englishStyle}>
        {Object.entries(englishText.data).map(([key, value]) => (
          <article key={key} id={key}>
            {Object.entries(value).map(([key, value]) => (
              <section key={key} className={key}>
                {value.replace(/\`/g, "")}
              </section>
            ))}
          </article>
        ))}
      </div>
    </>
  );
};

export default DialogContainer;
