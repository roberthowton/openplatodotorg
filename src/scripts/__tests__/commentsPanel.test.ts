import { describe, it, expect } from "vitest";
import {
  parseCommentParam,
  buildCommentParam,
  isPinned,
  getPanelVisibility,
  buildCommentsHtml,
  type Comment,
} from "../commentsPanel";

describe("parseCommentParam", () => {
  it("returns empty array for null", () => {
    expect(parseCommentParam(null)).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(parseCommentParam("")).toEqual([]);
  });

  it("parses single comment ID", () => {
    expect(parseCommentParam("en:comment1")).toEqual(["en:comment1"]);
  });

  it("parses multiple comma-separated IDs", () => {
    expect(parseCommentParam("en:c1,en:c2,gr:c3")).toEqual([
      "en:c1",
      "en:c2",
      "gr:c3",
    ]);
  });

  it("filters out empty strings from trailing comma", () => {
    expect(parseCommentParam("en:c1,")).toEqual(["en:c1"]);
  });

  it("filters out empty strings from leading comma", () => {
    expect(parseCommentParam(",en:c1")).toEqual(["en:c1"]);
  });
});

describe("buildCommentParam", () => {
  it("returns null for empty array", () => {
    expect(buildCommentParam([])).toBeNull();
  });

  it("builds single ID param", () => {
    expect(buildCommentParam(["en:c1"])).toBe("en:c1");
  });

  it("builds comma-separated param for multiple IDs", () => {
    expect(buildCommentParam(["en:c1", "gr:c2"])).toBe("en:c1,gr:c2");
  });
});

describe("isPinned", () => {
  it('returns true for "pinned"', () => {
    expect(isPinned("pinned")).toBe(true);
  });

  it("returns false for null", () => {
    expect(isPinned(null)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isPinned("")).toBe(false);
  });

  it("returns false for other values", () => {
    expect(isPinned("open")).toBe(false);
    expect(isPinned("closed")).toBe(false);
  });
});

describe("getPanelVisibility", () => {
  it('returns "pinned" when panel=pinned', () => {
    expect(getPanelVisibility("pinned", null)).toBe("pinned");
    expect(getPanelVisibility("pinned", "en:c1")).toBe("pinned");
  });

  it('returns "overlay" when comment param present and not pinned', () => {
    expect(getPanelVisibility(null, "en:c1")).toBe("overlay");
    expect(getPanelVisibility("", "en:c1,en:c2")).toBe("overlay");
  });

  it('returns "closed" when no comment and not pinned', () => {
    expect(getPanelVisibility(null, null)).toBe("closed");
    expect(getPanelVisibility(null, "")).toBe("closed");
    expect(getPanelVisibility("", null)).toBe("closed");
  });
});

describe("buildCommentsHtml", () => {
  const mockComments = new Map<string, Comment>([
    [
      "en:c1",
      { id: "c1", firstRead: false, targets: [], body: "First comment" },
    ],
    [
      "en:c2",
      { id: "c2", firstRead: true, targets: [], body: "Second comment" },
    ],
  ]);

  it("returns empty message for no comment IDs", () => {
    const html = buildCommentsHtml([], mockComments);
    expect(html).toContain("comments-panel-empty");
    expect(html).toContain("Click highlighted text");
  });

  it("renders single comment", () => {
    const html = buildCommentsHtml(["en:c1"], mockComments);
    expect(html).toContain("comment-item");
    expect(html).toContain("en:c1");
    expect(html).toContain("First comment");
  });

  it("renders multiple comments", () => {
    const html = buildCommentsHtml(["en:c1", "en:c2"], mockComments);
    expect(html).toContain("First comment");
    expect(html).toContain("Second comment");
  });

  it("returns not found message for missing comment ID", () => {
    const html = buildCommentsHtml(["en:nonexistent"], mockComments);
    expect(html).toContain("Comment not found");
  });

  it("escapes HTML in comment body", () => {
    const commentsWithHtml = new Map<string, Comment>([
      [
        "en:xss",
        {
          id: "xss",
          firstRead: false,
          targets: [],
          body: "<script>alert('xss')</script>",
        },
      ],
    ]);
    const html = buildCommentsHtml(["en:xss"], commentsWithHtml);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("escapes HTML in comment ID", () => {
    const commentsWithHtml = new Map<string, Comment>([
      [
        'en:<img onerror="alert()">',
        {
          id: '<img onerror="alert()">',
          firstRead: false,
          targets: [],
          body: "test",
        },
      ],
    ]);
    const html = buildCommentsHtml(
      ['en:<img onerror="alert()">'],
      commentsWithHtml
    );
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });
});
