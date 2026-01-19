import { ShowState } from "../../types";
import type { UrlState, UrlAction } from "./types";

/**
 * Pure reducer for URL state transitions
 */
export function urlReducer(state: UrlState, action: UrlAction): UrlState {
  switch (action.type) {
    case "SET_REF":
      return { ...state, ref: action.payload };

    case "SET_SHOW":
      return { ...state, show: action.payload };

    case "TOGGLE_SHOW":
      return toggleShow(state, action.payload);

    case "SET_FIRST_READ":
      return { ...state, show: [ShowState.FIRST_READ] };

    case "EXIT_FIRST_READ":
      return { ...state, show: [ShowState.GREEK, ShowState.ENGLISH] };

    case "SET_COMMENT":
      return { ...state, comment: action.payload };

    case "ADD_COMMENT":
      return state.comment.includes(action.payload)
        ? state
        : { ...state, comment: [...state.comment, action.payload] };

    case "CLEAR_COMMENT":
      return { ...state, comment: [] };

    case "PIN_PANEL":
      return { ...state, panel: "pinned" };

    case "UNPIN_PANEL":
      return { ...state, panel: null };

    case "TOGGLE_PIN":
      return { ...state, panel: state.panel === "pinned" ? null : "pinned" };

    default:
      return state;
  }
}

/**
 * Toggle a show state on/off
 */
function toggleShow(state: UrlState, showState: ShowState): UrlState {
  const { show } = state;

  // Toggling first read
  if (showState === ShowState.FIRST_READ) {
    if (show.includes(ShowState.FIRST_READ)) {
      // Exit first read → show both languages
      return { ...state, show: [ShowState.GREEK, ShowState.ENGLISH] };
    }
    // Enter first read
    return { ...state, show: [ShowState.FIRST_READ] };
  }

  // Currently in first read mode - can't toggle individual languages
  if (show.includes(ShowState.FIRST_READ)) {
    return state;
  }

  // Toggle specific language
  if (show.includes(showState)) {
    // Remove this language
    const newShow = show.filter((s) => s !== showState);
    // If nothing left, go to first read
    return {
      ...state,
      show: newShow.length === 0 ? [ShowState.FIRST_READ] : newShow,
    };
  } else {
    // Add this language
    return { ...state, show: [...show, showState] };
  }
}
