import { describe, expect, it } from "vitest";
import { DEMO_TOWN } from "./demo-data";
import { filterMembers } from "./search";

describe("filterMembers", () => {
  it("returns all members for an empty query", () => {
    expect(filterMembers(DEMO_TOWN.members, "")).toEqual(DEMO_TOWN.members);
    expect(filterMembers(DEMO_TOWN.members, "   ")).toEqual(DEMO_TOWN.members);
  });

  it("matches by name, case-insensitively", () => {
    const result = filterMembers(DEMO_TOWN.members, "papermoth");
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("papermoth-press");
  });

  it("matches by category", () => {
    const result = filterMembers(DEMO_TOWN.members, "craft");
    expect(result.every((m) => m.category === "craft")).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterMembers(DEMO_TOWN.members, "nonexistent-xyz")).toEqual([]);
  });
});
