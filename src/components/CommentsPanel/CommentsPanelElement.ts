import { buildCommentsHtml, type Comment, type CommentsData } from "../../scripts/commentsPanel";
import { dispatch, getUrlState } from "../../state/url";

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
      // ignore parse errors
    }
  }
  return commentsMap;
}

export function createCommentsPanelElement(): typeof HTMLElement {
  return class CommentsPanelElement extends HTMLElement {
    private controller: AbortController | null = null;
    private commentsMap: Map<string, Comment> = new Map();
    private activeElement: Element | null = null;

    connectedCallback() {
      if (this.controller) this.controller.abort();
      this.controller = new AbortController();
      const { signal } = this.controller;

      this.commentsMap = getAllComments();
      this.activeElement = null;

      const toggleBtn = this.querySelector("#comments-panel-toggle");
      const pinBtn = this.querySelector("#comments-panel-pin");
      const closeBtn = this.querySelector("#comments-panel-close");
      if (!toggleBtn) return;

      const renderComments = (commentIds: string[]) => {
        const content = this.querySelector("#comments-panel-content");
        if (!content) return;
        content.innerHTML = buildCommentsHtml(commentIds, this.commentsMap);
      };

      const openOverlay = () => {
        this.classList.remove("collapsed", "pinned");
        document.body.classList.remove("comments-panel-pinned");
      };

      const closePanel = () => {
        this.classList.add("collapsed");
        this.classList.remove("pinned");
        document.body.classList.remove("comments-panel-pinned");
        dispatch({ type: "UNPIN_PANEL" });
        dispatch({ type: "SET_COMMENT", payload: [] });
      };

      const pinPanel = () => {
        this.classList.remove("collapsed");
        this.classList.add("pinned");
        document.body.classList.add("comments-panel-pinned");
        dispatch({ type: "PIN_PANEL" });
      };

      const unpinPanel = () => {
        this.classList.remove("pinned");
        document.body.classList.remove("comments-panel-pinned");
        dispatch({ type: "UNPIN_PANEL" });
      };

      const togglePanel = () => {
        if (this.classList.contains("collapsed")) {
          openOverlay();
        } else {
          closePanel();
        }
      };

      const togglePin = () => {
        if (this.classList.contains("pinned")) {
          unpinPanel();
        } else {
          pinPanel();
        }
      };

      // Restore state from URL
      const urlState = getUrlState();
      const urlCommentIds = urlState.comment;
      const urlPinned = urlState.panel === "pinned";

      if (urlPinned) {
        pinPanel();
      } else if (urlCommentIds.length > 0) {
        openOverlay();
      }

      if (urlCommentIds.length > 0) {
        setTimeout(() => {
          const annotated = document.querySelector(
            `.annotated[data-note-ids="${urlCommentIds.join(",")}"]`
          ) ?? document.querySelector(`.annotated[data-note-ids*="${urlCommentIds[0]}"]`);

          if (annotated) {
            const ids = annotated.getAttribute("data-note-ids")?.split(",") ?? urlCommentIds;
            annotated.classList.add("active");
            this.activeElement = annotated;
            renderComments(ids);
            annotated.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      }

      toggleBtn.addEventListener("click", (e) => { e.stopPropagation(); togglePanel(); }, { signal });
      pinBtn?.addEventListener("click", (e) => { e.stopPropagation(); togglePin(); }, { signal });
      closeBtn?.addEventListener("click", (e) => { e.stopPropagation(); closePanel(); }, { signal });

      document.addEventListener("click", (e) => {
        const target = e.target as Element;
        const annotated = target.closest(".annotated");
        const clickedInPanel = target.closest("#comments-panel");

        if (this.activeElement) {
          this.activeElement.classList.remove("active");
        }

        if (annotated) {
          const commentIdsAttr = annotated.getAttribute("data-note-ids");
          if (!commentIdsAttr) return;
          const commentIds = commentIdsAttr.split(",").filter(Boolean);
          annotated.classList.add("active");
          this.activeElement = annotated;
          if (this.classList.contains("collapsed")) openOverlay();
          dispatch({ type: "SET_COMMENT", payload: commentIds });
          renderComments(commentIds);
        } else if (!clickedInPanel) {
          const isOverlay = !this.classList.contains("collapsed") && !this.classList.contains("pinned");
          if (isOverlay) {
            this.classList.add("collapsed");
            dispatch({ type: "SET_COMMENT", payload: [] });
          }
        }
      }, { signal });

      document.addEventListener("tei-annotations-ready", () => {
        const fresh = getAllComments();
        for (const [id, comment] of fresh) {
          this.commentsMap.set(id, comment);
        }
      }, { signal });
    }

    disconnectedCallback() {
      this.controller?.abort();
    }
  };
}
