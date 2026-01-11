import { getCollection } from "astro:content";

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

export type CommentsData = {
  comments: Comment[];
  anchorPositions: string[];
};

/**
 * Load comments for a dialogue/language, optionally filtered to firstRead only
 */
export async function loadComments(
  dialogueId: string,
  lang: "en" | "gr",
  firstReadOnly: boolean = false
): Promise<CommentsData> {
  const allComments = await getCollection("comment");

  // Filter by dialogue and language path prefix
  const pathPrefix = `${dialogueId}/${lang}/`;
  const filtered = allComments.filter((c) => {
    const matchesPath = c.id.startsWith(pathPrefix);
    const matchesFirstRead = !firstReadOnly || c.data.firstRead;
    return matchesPath && matchesFirstRead;
  });

  const comments: Comment[] = filtered.map((c) => ({
    id: c.data.id,
    firstRead: c.data.firstRead,
    targets: c.data.targets,
    body: c.body ?? "",
  }));

  const anchorPositions = extractAnchorPositions(comments);

  return { comments, anchorPositions };
}

/**
 * Extract all unique Stephanus positions needed for anchors
 */
function extractAnchorPositions(comments: Comment[]): string[] {
  const positions = new Set<string>();

  for (const comment of comments) {
    for (const target of comment.targets) {
      if (target.stephanus) {
        positions.add(target.stephanus);
      }
      if (target.stephanusRange) {
        positions.add(target.stephanusRange.start);
        positions.add(target.stephanusRange.end);
      }
    }
  }

  return Array.from(positions).sort();
}
