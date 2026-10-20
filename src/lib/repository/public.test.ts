import { describe, expect, it, vi } from "vitest";

vi.mock("../supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => null),
}));

import { findPublicMemberBySlug, getPublishedTownBySlug } from "./public";
import type { TownWithSlugMembers } from "./convert";

describe("getPublishedTownBySlug — Supabase not configured", () => {
  it("returns null instead of throwing when no Supabase project is configured", async () => {
    await expect(getPublishedTownBySlug("the-creative-quarter")).resolves.toBeNull();
  });
});

describe("findPublicMemberBySlug", () => {
  const town: TownWithSlugMembers = {
    id: "town-1",
    slug: "the-creative-quarter",
    name: "The Creative Quarter",
    publicationStatus: "published",
    members: [
      {
        id: "member-1",
        slug: "papermoth-press",
        version: 1,
        name: "Papermoth Press",
        category: "art",
        tagline: "",
        description: "",
        action: { id: "", label: "", url: "" },
        building: {
          id: "b1",
          exterior: "press-front",
          position: 0,
          bodyColor: "#c97b5f",
          trimColor: "#f3e3c8",
          signText: "Papermoth Press",
        },
        room: { template: "gallery", palette: "#d8cdbb", gridWidth: 6, gridHeight: 5, props: [] },
      },
    ],
  };

  it("finds a member by its public slug", () => {
    expect(findPublicMemberBySlug(town, "papermoth-press")?.id).toBe("member-1");
  });

  it("returns null for an unknown member slug", () => {
    expect(findPublicMemberBySlug(town, "no-such-member")).toBeNull();
  });
});
