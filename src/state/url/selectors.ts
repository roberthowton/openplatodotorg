import { ShowState } from "../../types";
import type { UrlState } from "./types";

/**
 * Parse URL state from a URL object (works SSR + client)
 */
export function parseUrlState(url: URL): UrlState {
  const params = url.searchParams;

  return {
    ref: params.get("ref"),
    show: parseShowParams(params.getAll("show")),
    comment: parseCommentParam(params.get("comment")),
    panel: params.get("panel") === "pinned" ? "pinned" : null,
  };
}

/**
 * Get current URL state from window.location (client-side only)
 */
export function getUrlState(): UrlState {
  return parseUrlState(new URL(window.location.href));
}

/**
 * Parse show params into ShowState array
 * Empty array or ["firstRead"] → [ShowState.FIRST_READ]
 * Otherwise returns the valid show states
 */
function parseShowParams(showParams: string[]): ShowState[] {
  if (showParams.length === 0) {
    return [ShowState.FIRST_READ];
  }

  const validStates = showParams.filter(
    (s): s is ShowState =>
      s === ShowState.GREEK ||
      s === ShowState.ENGLISH ||
      s === ShowState.FIRST_READ
  );

  if (validStates.length === 0 || validStates.includes(ShowState.FIRST_READ)) {
    return [ShowState.FIRST_READ];
  }

  return validStates;
}

/**
 * Parse comment param (comma-separated) into array
 */
function parseCommentParam(param: string | null): string[] {
  return param ? param.split(",").filter(Boolean) : [];
}

/**
 * Derive the combined ShowState enum value from the show array
 * Useful for compatibility with existing code
 */
export function deriveShowState(show: ShowState[]): ShowState {
  if (show.includes(ShowState.FIRST_READ)) {
    return ShowState.FIRST_READ;
  }
  if (show.includes(ShowState.GREEK) && show.includes(ShowState.ENGLISH)) {
    return ShowState.GREEK_AND_ENGLISH;
  }
  if (show.includes(ShowState.GREEK)) {
    return ShowState.GREEK;
  }
  if (show.includes(ShowState.ENGLISH)) {
    return ShowState.ENGLISH;
  }
  return ShowState.FIRST_READ;
}

/**
 * Check if a specific show state is active
 */
export function isShowActive(state: UrlState, showState: ShowState): boolean {
  if (showState === ShowState.FIRST_READ) {
    return state.show.includes(ShowState.FIRST_READ);
  }
  if (showState === ShowState.GREEK) {
    return state.show.includes(ShowState.GREEK);
  }
  if (showState === ShowState.ENGLISH) {
    return state.show.includes(ShowState.ENGLISH);
  }
  if (showState === ShowState.GREEK_AND_ENGLISH) {
    return (
      state.show.includes(ShowState.GREEK) &&
      state.show.includes(ShowState.ENGLISH)
    );
  }
  return false;
}
