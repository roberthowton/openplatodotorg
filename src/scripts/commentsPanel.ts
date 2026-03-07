import { escapeHtml } from "../utils/sanitize";

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

