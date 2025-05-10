import { getEntry, type CollectionEntry } from "astro:content";
import type { DialogContainerProps } from "../components/dialog-container";

export const parseBekkerPages = (
  dialog: CollectionEntry<"dialogs">["data"],
) => {
  // todo
};

export async function fetchTranslations(
  dialog: string,
): Promise<DialogContainerProps> {
  return {
    EN: await getEntry("dialogs", `${dialog}/english`),
    EL: await getEntry("dialogs", `${dialog}/greek`),
  };
}
