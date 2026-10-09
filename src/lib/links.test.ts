import { describe, expect, it } from "vitest";
import { isSafeUrl } from "./links";

describe("isSafeUrl", () => {
  it("accepts https, http and mailto", () => {
    expect(isSafeUrl("https://example.example/page")).toBe(true);
    expect(isSafeUrl("http://example.example/page")).toBe(true);
    expect(isSafeUrl("mailto:hello@example.example")).toBe(true);
  });

  it("rejects javascript: and data:", () => {
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
  });

  it("rejects unparseable strings", () => {
    expect(isSafeUrl("not a url")).toBe(false);
    expect(isSafeUrl("")).toBe(false);
  });
});
