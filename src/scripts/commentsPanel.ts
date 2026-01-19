// ============================================
// Types
// ============================================

export type Comment = {
  id: string;
  firstRead: boolean;
  targets: unknown[];
  body: string;
};

export type CommentsData = {
  comments: Comment[];
  anchorPositions: string[];
};

// ============================================
// Pure utility functions (testable)
// ============================================

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Parse comment IDs from URL parameter value
 */
export function parseCommentParam(param: string | null): string[] {
  return param ? param.split(",").filter(Boolean) : [];
}

/**
 * Build comment parameter value from IDs
 */
export function buildCommentParam(commentIds: string[]): string | null {
  return commentIds.length > 0 ? commentIds.join(",") : null;
}

/**
 * Check if panel state is pinned
 */
export function isPinned(panelParam: string | null): boolean {
  return panelParam === "pinned";
}

/**
 * Determine panel visibility state from URL params
 * Returns: 'pinned' | 'overlay' | 'closed'
 */
export function getPanelVisibility(
  panelParam: string | null,
  commentParam: string | null
): "pinned" | "overlay" | "closed" {
  if (panelParam === "pinned") return "pinned";
  if (commentParam && commentParam.length > 0) return "overlay";
  return "closed";
}

/**
 * Build HTML for rendering comments
 */
export function buildCommentsHtml(
  commentIds: string[],
  commentsMap: Map<string, Comment>
): string {
  if (commentIds.length === 0) {
    return '<p class="comments-panel-empty">Click highlighted text to view comments</p>';
  }

  const html = commentIds
    .map((id) => {
      const comment = commentsMap.get(id);
      if (!comment) return "";

      return `
        <div class="comment-item">
          <div class="comment-item-id">${escapeHtml(id)}</div>
          <div class="comment-item-body">${escapeHtml(comment.body)}</div>
        </div>
      `;
    })
    .filter(Boolean)
    .join("");

  return html || '<p class="comments-panel-empty">Comment not found</p>';
}

// ============================================
// DOM-dependent functions
// ============================================

import { dispatch, getUrlState } from "../state/url";

/**
 * Get all comments data from both language JSON scripts
 * Keys are prefixed with language: "en:commentId" or "gr:commentId"
 */
function getAllComments(): Map<string, Comment> {
  const commentsMap = new Map<string, Comment>();

  for (const lang of ["en", "gr"]) {
    const script = document.getElementById(`comments-${lang}`);
    if (!script) continue;

    try {
      const data: CommentsData = JSON.parse(script.textContent || "");
      for (const comment of data.comments) {
        commentsMap.set(`${lang}:${comment.id}`, comment);
      }
    } catch {
      // Ignore parse errors
    }
  }

  return commentsMap;
}

/**
 * Render comments in the panel
 */
function renderComments(commentIds: string[], commentsMap: Map<string, Comment>): void {
  const content = document.getElementById("comments-panel-content");
  if (!content) return;
  content.innerHTML = buildCommentsHtml(commentIds, commentsMap);
}

/**
 * Update URL with comment parameter via centralized dispatch
 */
function updateUrlWithComment(commentIds: string[]): void {
  dispatch({ type: "SET_COMMENT", payload: commentIds });
}

/**
 * Update URL with pinned state via centralized dispatch
 */
function updateUrlWithPinnedState(pinned: boolean): void {
  if (pinned) {
    dispatch({ type: "PIN_PANEL" });
  } else {
    dispatch({ type: "UNPIN_PANEL" });
  }
}

/**
 * Check if panel is pinned from URL
 */
function isPinnedFromUrl(): boolean {
  return getUrlState().panel === "pinned";
}

/**
 * Get comment IDs from URL parameter
 */
function getCommentFromUrl(): string[] {
  return getUrlState().comment;
}

/**
 * Find and activate the annotated element for given comment IDs
 */
function activateCommentFromUrl(
  commentIds: string[],
  commentsMap: Map<string, Comment>
): Element | null {
  if (commentIds.length === 0) return null;

  // Find an annotated element that contains all these comment IDs
  const annotated = document.querySelector(
    `.annotated[data-note-ids="${commentIds.join(",")}"]`
  );

  if (annotated) {
    annotated.classList.add("active");
    renderComments(commentIds, commentsMap);
    // Scroll into view
    annotated.scrollIntoView({ behavior: "smooth", block: "center" });
    return annotated;
  }

  // Fallback: find element containing first comment ID
  const firstId = commentIds[0];
  const fallback = document.querySelector(
    `.annotated[data-note-ids*="${firstId}"]`
  );
  if (fallback) {
    const ids = fallback.getAttribute("data-note-ids")?.split(",") || [];
    fallback.classList.add("active");
    renderComments(ids, commentsMap);
    fallback.scrollIntoView({ behavior: "smooth", block: "center" });
    return fallback;
  }

  return null;
}

/**
 * Initialize the comments panel click handling
 */
export function initCommentsPanel(): void {
  const commentsMap = getAllComments();
  let activeElement: Element | null = null;
  const panel = document.getElementById("comments-panel");
  const toggleBtn = document.getElementById("comments-panel-toggle");
  const pinBtn = document.getElementById("comments-panel-pin");
  const closeBtn = document.getElementById("comments-panel-close");

  if (!panel || !toggleBtn) return;

  /**
   * Open panel as overlay (not pinned)
   */
  function openOverlay(): void {
    panel!.classList.remove("collapsed");
    panel!.classList.remove("pinned");
    document.body.classList.remove("comments-panel-pinned");
  }

  /**
   * Close panel and clear comment
   */
  function closePanel(): void {
    panel!.classList.add("collapsed");
    panel!.classList.remove("pinned");
    document.body.classList.remove("comments-panel-pinned");
    updateUrlWithPinnedState(false);
    updateUrlWithComment([]);
  }

  /**
   * Pin panel (pushes content aside)
   */
  function pinPanel(): void {
    panel!.classList.remove("collapsed");
    panel!.classList.add("pinned");
    document.body.classList.add("comments-panel-pinned");
    updateUrlWithPinnedState(true);
  }

  /**
   * Unpin panel (back to overlay)
   */
  function unpinPanel(): void {
    panel!.classList.remove("pinned");
    document.body.classList.remove("comments-panel-pinned");
    updateUrlWithPinnedState(false);
  }

  /**
   * Toggle panel open/closed (for toggle button)
   */
  function togglePanel(): void {
    const isCollapsed = panel!.classList.contains("collapsed");
    if (isCollapsed) {
      openOverlay();
    } else {
      closePanel();
    }
  }

  /**
   * Toggle pin state
   */
  function togglePin(): void {
    const isPinned = panel!.classList.contains("pinned");
    if (isPinned) {
      unpinPanel();
    } else {
      pinPanel();
    }
  }

  // Restore state from URL on load
  const urlCommentIds = getCommentFromUrl();
  const urlPinned = isPinnedFromUrl();

  if (urlPinned) {
    pinPanel();
  } else if (urlCommentIds.length > 0) {
    // Comment param present → open overlay
    openOverlay();
  }
  // Otherwise stay collapsed (default)

  // Scroll to anchor if comment present
  if (urlCommentIds.length > 0) {
    setTimeout(() => {
      activeElement = activateCommentFromUrl(urlCommentIds, commentsMap);
    }, 100);
  }

  // Handle toggle button click
  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePanel();
  });

  // Handle pin button click
  pinBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePin();
  });

  // Handle close button click
  closeBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    closePanel();
  });

  // Handle clicks on annotated text and dismiss overlay on click-away
  document.addEventListener("click", (e) => {
    const target = e.target as Element;
    const annotated = target.closest(".annotated");
    const clickedInPanel = target.closest("#comments-panel");

    // Remove active state from previous element
    if (activeElement) {
      activeElement.classList.remove("active");
    }

    if (annotated) {
      // Get comment IDs from data attribute
      const commentIdsAttr = annotated.getAttribute("data-note-ids");
      if (!commentIdsAttr) return;

      const commentIds = commentIdsAttr.split(",").filter(Boolean);

      // Mark as active
      annotated.classList.add("active");
      activeElement = annotated;

      // Open panel as overlay if collapsed (don't change if already pinned)
      const isCollapsed = panel!.classList.contains("collapsed");
      if (isCollapsed) {
        openOverlay();
      }

      // Update URL for sharability
      updateUrlWithComment(commentIds);

      // Render comments in panel
      renderComments(commentIds, commentsMap);
    } else if (!clickedInPanel) {
      // Clicked outside panel and not on annotation - dismiss overlay if in transient mode
      const isOverlay = !panel!.classList.contains("collapsed") && !panel!.classList.contains("pinned");
      if (isOverlay) {
        panel!.classList.add("collapsed");
        updateUrlWithComment([]);
      }
    }
  });

  // Re-initialize when new annotations are added (for SPA navigation)
  document.addEventListener("tei-annotations-ready", () => {
    // Refresh comments map in case new ones were loaded
    const newCommentsMap = getAllComments();
    for (const [id, comment] of newCommentsMap) {
      commentsMap.set(id, comment);
    }
  });
}
