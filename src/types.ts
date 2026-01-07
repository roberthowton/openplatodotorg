export enum ShowState {
  GREEK = "gr",
  ENGLISH = "en",
  GREEK_AND_ENGLISH = "gr_en",
  FIRST_READ = "firstRead",
  UNKNOWN = "unknown",
}

export enum ShowStateAction {
  SHOW = "show",
  HIDE = "hide",
}

export type UrlParams = "ref" | "show";
