import type { AnchorIndex } from "./injectAnchors";

export type CommentTarget = {
  stephanus?: string;
  stephanusRange?: { start: string; end: string };
  match?: string;
};

export type Comment = {
  id: string;
  firstRead: boolean;
  targets: CommentTarget[];
  body: string;
};

type Boundary = {
  node: Node;
  offset: number;
  noteId: string;
  type: "start" | "end";
};

/**
 * Parse comments data from JSON script tag
 */
function getCommentsData(lang: "en" | "gr"): { comments: Comment[] } | null {
  const script = document.getElementById(`comments-${lang}`);
  if (!script) return null;
  try {
    return JSON.parse(script.textContent || "");
  } catch {
    return null;
  }
}

/**
 * Find text node and offset for a match string starting from an anchor
 */
function findMatchPosition(
  anchor: HTMLElement,
  match: string
): { node: Text; offset: number } | null {
  // Find the tei-container to search within
  const container = anchor.closest("tei-container") || document.body;

  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT
  );

  // Position walker at the anchor
  walker.currentNode = anchor;

  // Search forward from anchor
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    const text = node.textContent || "";
    const idx = text.indexOf(match);
    if (idx !== -1) {
      return { node, offset: idx };
    }
  }

  return null;
}

/**
 * Find end position for a match (start position + match length)
 */
function findMatchEnd(
  startNode: Text,
  startOffset: number,
  matchLength: number
): { node: Text; offset: number } {
  let remaining = matchLength;
  let node: Text = startNode;
  let offset = startOffset;

  while (remaining > 0) {
    const available = (node.textContent?.length ?? 0) - offset;
    if (remaining <= available) {
      return { node, offset: offset + remaining };
    }
    remaining -= available;

    // Move to next text node
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT
    );
    walker.currentNode = node;
    const next = walker.nextNode() as Text | null;
    if (!next) break;
    node = next;
    offset = 0;
  }

  return { node, offset: offset + remaining };
}

/**
 * Compare two positions in document order
 */
function comparePositions(
  a: { node: Node; offset: number },
  b: { node: Node; offset: number }
): number {
  if (a.node === b.node) {
    return a.offset - b.offset;
  }
  const position = a.node.compareDocumentPosition(b.node);
  if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
    return -1;
  }
  if (position & Node.DOCUMENT_POSITION_PRECEDING) {
    return 1;
  }
  return 0;
}

/**
 * Collect boundaries for all comment targets
 */
function collectBoundaries(
  comments: Comment[],
  anchorIndex: AnchorIndex
): Boundary[] {
  const boundaries: Boundary[] = [];

  for (const comment of comments) {
    for (const target of comment.targets) {
      const startStephanus = target.stephanus || target.stephanusRange?.start;
      const endStephanus = target.stephanusRange?.end || startStephanus;

      if (!startStephanus) continue;

      const startAnchor = anchorIndex.get(startStephanus);
      const endAnchor = anchorIndex.get(endStephanus!);

      if (!startAnchor) {
        console.warn(`Anchor not found: ${startStephanus}`);
        continue;
      }

      let startPos: { node: Node; offset: number } | null = null;
      let endPos: { node: Node; offset: number } | null = null;

      if (target.match) {
        // Find exact match position
        const matchPos = findMatchPosition(startAnchor, target.match);
        if (!matchPos) {
          console.warn(`Match not found: "${target.match}" after ${startStephanus}`);
          continue;
        }
        startPos = matchPos;
        endPos = findMatchEnd(matchPos.node, matchPos.offset, target.match.length);
      } else {
        // Use anchor positions (entire range between anchors)
        // Find first text node after start anchor
        const startWalker = document.createTreeWalker(
          startAnchor.parentElement || document.body,
          NodeFilter.SHOW_TEXT
        );
        startWalker.currentNode = startAnchor;
        const startText = startWalker.nextNode() as Text | null;
        if (startText) {
          startPos = { node: startText, offset: 0 };
        }

        // Find last text node before end anchor
        if (endAnchor) {
          const endWalker = document.createTreeWalker(
            endAnchor.parentElement || document.body,
            NodeFilter.SHOW_TEXT
          );
          endWalker.currentNode = endAnchor;
          const endText = endWalker.previousNode() as Text | null;
          if (endText) {
            endPos = { node: endText, offset: endText.textContent?.length ?? 0 };
          }
        }
      }

      if (startPos && endPos) {
        boundaries.push({ ...startPos, noteId: comment.id, type: "start" });
        boundaries.push({ ...endPos, noteId: comment.id, type: "end" });
      }
    }
  }

  // Sort by document order, then by type (ends before starts at same position)
  boundaries.sort((a, b) => {
    const posCompare = comparePositions(a, b);
    if (posCompare !== 0) return posCompare;
    // At same position: ends come before starts
    if (a.type !== b.type) {
      return a.type === "end" ? -1 : 1;
    }
    return 0;
  });

  return boundaries;
}

/**
 * Wrap a single text node (or portion) with an annotation span
 */
function wrapTextNode(
  node: Text,
  startOffset: number,
  endOffset: number,
  noteIds: Set<string>
): void {
  const text = node.textContent || "";
  if (startOffset >= endOffset || startOffset >= text.length) return;

  const actualEnd = Math.min(endOffset, text.length);

  const range = document.createRange();
  range.setStart(node, startOffset);
  range.setEnd(node, actualEnd);

  const span = document.createElement("span");
  span.className = "annotated";
  span.dataset.noteIds = Array.from(noteIds).join(",");

  try {
    range.surroundContents(span);
  } catch {
    // This shouldn't fail for single text nodes, but handle gracefully
    return;
  }
}

/**
 * Wrap a text range with annotation spans (handles cross-element ranges)
 */
function wrapRange(
  startNode: Text,
  startOffset: number,
  endNode: Text,
  endOffset: number,
  noteIds: Set<string>
): void {
  // Same node - simple case
  if (startNode === endNode) {
    wrapTextNode(startNode, startOffset, endOffset, noteIds);
    return;
  }

  // Different nodes - wrap each text node individually
  const noteIdsStr = Array.from(noteIds).join(",");

  // Wrap the start node (from offset to end)
  wrapTextNode(startNode, startOffset, startNode.textContent?.length || 0, noteIds);

  // Walk through intermediate text nodes and wrap fully
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT
  );
  walker.currentNode = startNode;

  let node = walker.nextNode() as Text | null;
  while (node && node !== endNode) {
    // Skip nodes already wrapped or empty
    if (node.parentElement?.classList.contains("annotated") ||
        !node.textContent?.trim()) {
      node = walker.nextNode() as Text | null;
      continue;
    }

    const span = document.createElement("span");
    span.className = "annotated";
    span.dataset.noteIds = noteIdsStr;

    const parent = node.parentNode;
    if (parent) {
      parent.insertBefore(span, node);
      span.appendChild(node);
    }

    node = walker.nextNode() as Text | null;
  }

  // Wrap the end node (from start to offset)
  if (endNode && !endNode.parentElement?.classList.contains("annotated")) {
    wrapTextNode(endNode, 0, endOffset, noteIds);
  }
}

/**
 * Apply annotations using segment decomposition
 */
export function annotate(
  container: HTMLElement,
  lang: "en" | "gr",
  anchorIndex: AnchorIndex
): void {
  const data = getCommentsData(lang);
  if (!data || !data.comments.length) return;

  const boundaries = collectBoundaries(data.comments, anchorIndex);
  if (!boundaries.length) return;

  const activeNotes = new Set<string>();
  let prevNode: Text | null = null;
  let prevOffset = 0;

  for (const boundary of boundaries) {
    // Wrap segment from previous position to current position
    if (prevNode && activeNotes.size > 0) {
      const currNode = boundary.node;
      const currOffset = boundary.offset;

      if (currNode instanceof Text && prevNode instanceof Text) {
        // Only wrap if there's actual content
        if (prevNode !== currNode || prevOffset < currOffset) {
          wrapRange(prevNode, prevOffset, currNode as Text, currOffset, new Set(activeNotes));
        }
      }
    }

    // Update active notes
    if (boundary.type === "start") {
      activeNotes.add(boundary.noteId);
    } else {
      activeNotes.delete(boundary.noteId);
    }

    // Update previous position
    if (boundary.node instanceof Text) {
      prevNode = boundary.node;
      prevOffset = boundary.offset;
    }
  }
}
