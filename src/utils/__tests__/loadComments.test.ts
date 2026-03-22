import { describe, it, expect, vi } from "vitest";

const { mockGetCollection } = vi.hoisted(() => ({ mockGetCollection: vi.fn() }));
vi.mock("astro:content", () => ({ getCollection: mockGetCollection }));

import { loadComments } from "../loadComments";

function makeEntry(id: string, data: object, body = "") {
  return { id, data, body };
}

describe("loadComments", () => {
  it("filters by dialogue and language path prefix", async () => {
    mockGetCollection.mockResolvedValue([
      makeEntry("meno/en/comment-1", { id: "c1", firstRead: false, targets: [] }),
      makeEntry("meno/gr/comment-2", { id: "c2", firstRead: false, targets: [] }),
      makeEntry("republic/en/comment-3", { id: "c3", firstRead: false, targets: [] }),
    ]);

    const result = await loadComments("meno", "en");
    expect(result.comments).toHaveLength(1);
    expect(result.comments[0].id).toBe("c1");
  });

  it("filters to firstRead only when flag set", async () => {
    mockGetCollection.mockResolvedValue([
      makeEntry("meno/en/c1", { id: "c1", firstRead: true, targets: [] }),
      makeEntry("meno/en/c2", { id: "c2", firstRead: false, targets: [] }),
    ]);

    const result = await loadComments("meno", "en", true);
    expect(result.comments).toHaveLength(1);
    expect(result.comments[0].id).toBe("c1");
  });

  it("includes all when firstReadOnly is false (default)", async () => {
    mockGetCollection.mockResolvedValue([
      makeEntry("meno/en/c1", { id: "c1", firstRead: true, targets: [] }),
      makeEntry("meno/en/c2", { id: "c2", firstRead: false, targets: [] }),
    ]);

    const result = await loadComments("meno", "en");
    expect(result.comments).toHaveLength(2);
  });

  it("extracts stephanus anchor positions", async () => {
    mockGetCollection.mockResolvedValue([
      makeEntry("meno/en/c1", {
        id: "c1",
        firstRead: false,
        targets: [{ stephanus: "73a1" }, { stephanus: "74b2" }],
      }),
    ]);

    const result = await loadComments("meno", "en");
    expect(result.anchorPositions).toContain("73a1");
    expect(result.anchorPositions).toContain("74b2");
  });

  it("extracts stephanusRange start and end positions", async () => {
    mockGetCollection.mockResolvedValue([
      makeEntry("meno/en/c1", {
        id: "c1",
        firstRead: false,
        targets: [{ stephanusRange: { start: "73a1", end: "74b2" } }],
      }),
    ]);

    const result = await loadComments("meno", "en");
    expect(result.anchorPositions).toContain("73a1");
    expect(result.anchorPositions).toContain("74b2");
  });

  it("deduplicates anchor positions", async () => {
    mockGetCollection.mockResolvedValue([
      makeEntry("meno/en/c1", {
        id: "c1",
        firstRead: false,
        targets: [{ stephanus: "73a1" }],
      }),
      makeEntry("meno/en/c2", {
        id: "c2",
        firstRead: false,
        targets: [{ stephanus: "73a1" }],
      }),
    ]);

    const result = await loadComments("meno", "en");
    expect(result.anchorPositions.filter((p) => p === "73a1")).toHaveLength(1);
  });

  it("sorts anchor positions", async () => {
    mockGetCollection.mockResolvedValue([
      makeEntry("meno/en/c1", {
        id: "c1",
        firstRead: false,
        targets: [{ stephanus: "74b2" }, { stephanus: "73a1" }],
      }),
    ]);

    const result = await loadComments("meno", "en");
    expect(result.anchorPositions).toEqual(["73a1", "74b2"]);
  });

  it("returns empty arrays when no comments match", async () => {
    mockGetCollection.mockResolvedValue([
      makeEntry("republic/en/c1", { id: "c1", firstRead: false, targets: [] }),
    ]);

    const result = await loadComments("meno", "en");
    expect(result.comments).toHaveLength(0);
    expect(result.anchorPositions).toHaveLength(0);
  });

  it("uses empty string for body when body is undefined", async () => {
    mockGetCollection.mockResolvedValue([
      makeEntry("meno/en/c1", { id: "c1", firstRead: false, targets: [] }, undefined as any),
    ]);

    const result = await loadComments("meno", "en");
    expect(result.comments[0].body).toBe("");
  });
});
