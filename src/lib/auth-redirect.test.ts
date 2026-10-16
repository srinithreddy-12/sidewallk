import { describe, expect, it } from "vitest";
import { safeAuthNextPath } from "./auth-redirect";

describe("safeAuthNextPath", () => {
  it.each([
    [null, "/"],
    ["", "/"],
    ["dashboard", "/"],
    ["https://attacker.example", "/"],
    ["//attacker.example/path", "/"],
    ["/", "/"],
    ["/manage/town-one?tab=members", "/manage/town-one?tab=members"],
  ])("maps %s to %s", (value, expected) => {
    expect(safeAuthNextPath(value)).toBe(expected);
  });
});
