export type AnchorIndex = Map<string, HTMLElement>;

/**
 * Parse comments data from JSON script tag
 */
function getCommentsData(lang: "en" | "gr"): { anchorPositions: string[] } | null {
  const script = document.getElementById(`comments-${lang}`);
  if (!script) return null;
  try {
    return JSON.parse(script.textContent || "");
  } catch {
    console.warn(`Failed to parse comments-${lang} JSON`);
    return null;
  }
}

/**
 * Inject anchor spans after tei-lb elements for given positions
 */
export function injectAnchors(
  container: HTMLElement,
  lang: "en" | "gr"
): AnchorIndex {
  const anchorIndex: AnchorIndex = new Map();
  const data = getCommentsData(lang);

  if (!data || !data.anchorPositions.length) {
    return anchorIndex;
  }

  for (const pos of data.anchorPositions) {
    // Find tei-lb with matching n attribute
    const lb = container.querySelector(`tei-lb[n="${pos}"]`);
    if (!lb) {
      console.warn(`Anchor target not found: tei-lb[n="${pos}"]`);
      continue;
    }

    // Create anchor span
    const anchor = document.createElement("span");
    anchor.id = `a-${pos}`;
    anchor.className = "tei-anchor";
    anchor.dataset.stephanus = pos;

    // Insert after the lb element
    lb.after(anchor);
    anchorIndex.set(pos, anchor);
  }

  return anchorIndex;
}
