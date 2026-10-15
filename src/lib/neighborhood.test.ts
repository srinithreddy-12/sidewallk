import { describe, expect, it } from "vitest";
import { DEMO_TOWN } from "./demo-data";
import { facadeVariants } from "./neighborhood";
import type { Member } from "./types";

function buildingOf(id: string, exterior: Member["building"]["exterior"], position: number): Member {
  return {
    id,
    name: id,
    category: "craft",
    tagline: "",
    description: "",
    action: { id: `${id}-action`, label: "", url: "" },
    building: { id: `${id}-building`, exterior, position, bodyColor: "#000000", trimColor: "#ffffff", signText: id },
    room: { template: "shop", palette: "#ffffff", gridWidth: 6, gridHeight: 5, props: [] },
  };
}

describe("facadeVariants", () => {
  it("alternates variants between two buildings that share an exterior kind", () => {
    const members = [buildingOf("a", "shop-front", 0), buildingOf("b", "shop-front", 1)];
    const variants = facadeVariants(members);
    expect(variants.a).not.toBe(variants.b);
  });

  it("gives every pair of same-kind buildings in the real demo town distinct variants", () => {
    const variants = facadeVariants(DEMO_TOWN.members);
    const byKind = new Map<string, string[]>();
    for (const member of DEMO_TOWN.members) {
      const kind = member.building.exterior;
      byKind.set(kind, [...(byKind.get(kind) ?? []), member.id]);
    }
    for (const [kind, ids] of byKind) {
      if (ids.length < 2) continue;
      const seen = new Set<number>();
      for (const id of ids) {
        const v = variants[id]!;
        expect(seen.has(v), `two ${kind} buildings share variant ${v}`).toBe(false);
        seen.add(v);
      }
    }
    // Sanity: the current demo data actually has duplicated kinds, so the
    // loop above isn't vacuously skipping every kind.
    const duplicated = [...byKind.values()].filter((ids) => ids.length >= 2);
    expect(duplicated.length).toBeGreaterThan(0);
  });

  it("still assigns a variant to a kind that appears only once", () => {
    const members = [buildingOf("solo", "gallery-front", 0)];
    expect(facadeVariants(members).solo).toBe(0);
  });

  it("is stable across repeated calls on the same member list", () => {
    const members = [buildingOf("a", "cafe-front", 0), buildingOf("b", "cafe-front", 1), buildingOf("c", "cafe-front", 2)];
    const first = facadeVariants(members);
    const second = facadeVariants(members);
    expect(second).toEqual(first);
  });

  it("depends on list order, not on member id or position, for its rank", () => {
    // Same two members, reversed order — the rank-within-kind (and so the
    // variant) swaps, confirming the assignment is positional/stable rather
    // than hashed from the id.
    const a = buildingOf("a", "studio-front", 5);
    const b = buildingOf("b", "studio-front", 1);
    const forward = facadeVariants([a, b]);
    const reversed = facadeVariants([b, a]);
    expect(forward.a).toBe(0);
    expect(forward.b).toBe(1);
    expect(reversed.b).toBe(0);
    expect(reversed.a).toBe(1);
  });
});
