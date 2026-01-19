import { describe, it, expect } from "vitest";
import { escapeHtml } from "../sanitize";

describe("escapeHtml", () => {
  it("escapes ampersands", () => {
    expect(escapeHtml("foo & bar")).toBe("foo &amp; bar");
  });

  it("escapes less than", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
  });

  it("escapes greater than", () => {
    expect(escapeHtml("a > b")).toBe("a &gt; b");
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('say "hello"')).toBe("say &quot;hello&quot;");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#039;s");
  });

  it("handles empty string", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("handles text with no special chars", () => {
    expect(escapeHtml("plain text")).toBe("plain text");
  });

  it("escapes multiple special chars", () => {
    expect(escapeHtml('<a href="test">link</a>')).toBe(
      "&lt;a href=&quot;test&quot;&gt;link&lt;/a&gt;"
    );
  });
});
