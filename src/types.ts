import type { ReferenceScheme } from "./utils/referenceSchemes";

export interface DialogueConfig {
  /** Title rendered inside <tei-head> per language */
  teiTitle: { gr: string; en: string; firstRead?: string };
  /** e.g. "103a1" — the first lb@n value in this document */
  firstLineReference: string;
  /** @deprecated use firstLineReference */
  firstLineStephanusReference?: string;
  /** Citation/reference scheme for marker display. Resolved by processTei. */
  referenceScheme: ReferenceScheme;
}

export enum ShowState {
  GREEK = "gr",
  ENGLISH = "en",
  GREEK_AND_ENGLISH = "gr_en",
  FIRST_READ = "firstRead",
  UNKNOWN = "unknown",
}
