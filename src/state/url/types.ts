import { ShowState } from "../../types";

export interface UrlState {
  ref: string | null;
  show: ShowState[];
  comment: string[];
  panel: "pinned" | null;
}

export type UrlAction =
  | { type: "SET_REF"; payload: string | null }
  | { type: "SET_SHOW"; payload: ShowState[] }
  | { type: "TOGGLE_SHOW"; payload: ShowState }
  | { type: "SET_FIRST_READ" }
  | { type: "EXIT_FIRST_READ" }
  | { type: "SET_COMMENT"; payload: string[] }
  | { type: "ADD_COMMENT"; payload: string }
  | { type: "CLEAR_COMMENT" }
  | { type: "PIN_PANEL" }
  | { type: "UNPIN_PANEL" }
  | { type: "TOGGLE_PIN" };

// Actions that require hard navigation (page re-render)
export const HARD_NAV_ACTIONS: UrlAction["type"][] = [
  "SET_SHOW",
  "TOGGLE_SHOW",
  "SET_FIRST_READ",
  "EXIT_FIRST_READ",
];
