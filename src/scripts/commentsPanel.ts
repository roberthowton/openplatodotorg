type Comment = {
  id: string;
  firstRead: boolean;
  targets: unknown[];
  body: string;
};

type CommentsData = {
  comments: Comment[];
  anchorPositions: string[];
};

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
        // Prefix with language to avoid collisions
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

  if (commentIds.length === 0) {
    content.innerHTML = '<p class="comments-panel-empty">Click highlighted text to view comments</p>';
    return;
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

  content.innerHTML = html || '<p class="comments-panel-empty">Comment not found</p>';
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Update URL with comment parameter
 */
function updateUrlWithComment(commentIds: string[]): void {
  const url = new URL(window.location.href);
  if (commentIds.length > 0) {
    url.searchParams.set("comment", commentIds.join(","));
  } else {
    url.searchParams.delete("comment");
  }
  window.history.replaceState({}, "", url.toString());
}

/**
 * Get comment IDs from URL parameter
 */
function getCommentFromUrl(): string[] {
  const url = new URL(window.location.href);
  const param = url.searchParams.get("comment");
  return param ? param.split(",").filter(Boolean) : [];
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

  // Restore from URL on load
  const urlCommentIds = getCommentFromUrl();
  if (urlCommentIds.length > 0) {
    // Defer to allow DOM to be ready
    setTimeout(() => {
      activeElement = activateCommentFromUrl(urlCommentIds, commentsMap);
    }, 100);
  }

  // Handle clicks on annotated text
  document.addEventListener("click", (e) => {
    const target = e.target as Element;
    const annotated = target.closest(".annotated");

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

      // Update URL for sharability
      updateUrlWithComment(commentIds);

      // Render comments in panel
      renderComments(commentIds, commentsMap);
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
