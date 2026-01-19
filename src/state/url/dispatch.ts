import { navigate } from "astro:transitions/client";
import type { UrlAction } from "./types";
import { HARD_NAV_ACTIONS } from "./types";
import { getUrlState } from "./selectors";
import { urlReducer } from "./reducer";
import { buildUrl } from "./actions";

/**
 * Dispatch a URL action
 * Uses hard navigation for show changes (requires re-render)
 * Uses soft navigation (replaceState) for everything else
 */
export function dispatch(action: UrlAction): void {
  const currentState = getUrlState();
  const newState = urlReducer(currentState, action);

  // Skip if state unchanged
  if (JSON.stringify(currentState) === JSON.stringify(newState)) {
    return;
  }

  const newUrl = buildUrl(new URL(window.location.href), newState);

  if (HARD_NAV_ACTIONS.includes(action.type)) {
    // Hard navigation - triggers full page transition
    navigate(newUrl.href);
  } else {
    // Soft navigation - just update URL
    window.history.replaceState({}, "", newUrl.href);
  }
}

/**
 * Dispatch multiple actions sequentially
 */
export function dispatchAll(actions: UrlAction[]): void {
  let state = getUrlState();

  for (const action of actions) {
    state = urlReducer(state, action);
  }

  const newUrl = buildUrl(new URL(window.location.href), state);
  const needsHardNav = actions.some((a) => HARD_NAV_ACTIONS.includes(a.type));

  if (needsHardNav) {
    navigate(newUrl.href);
  } else {
    window.history.replaceState({}, "", newUrl.href);
  }
}
