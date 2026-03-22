export interface DialogueConfig {
  /** Title rendered inside <tei-head> per language */
  teiTitle: { gr: string; en: string; firstRead?: string };
  /** e.g. "103a1" — used by handle-tei-header and handle-line-begin */
  firstLineStephanusReference: string;
}

export enum ShowState {
  GREEK = "gr",
  ENGLISH = "en",
  GREEK_AND_ENGLISH = "gr_en",
  FIRST_READ = "firstRead",
  UNKNOWN = "unknown",
}
