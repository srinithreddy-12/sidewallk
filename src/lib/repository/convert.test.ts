import { describe, expect, it } from "vitest";
import { convertMemberRow, convertPublicMemberRow, convertTownRow } from "./convert";
import type { MemberRow, TownRow } from "./rows";

function baseRow(overrides: Partial<MemberRow> = {}): MemberRow {
  return {
    id: "member-1",
    town_id: "town-1",
    slug: "papermoth-press",
    name: "Papermoth Press",
    category: "art",
    tagline: "Risograph prints.",
    description: "A print studio.",
    action: { id: "action-1", label: "Visit", url: "https://papermoth.example/visit" },
    building: {
      id: "building-1",
      exterior: "press-front",
      bodyColor: "#c97b5f",
      trimColor: "#f3e3c8",
      signText: "Papermoth Press",
    },
    room: {
      template: "gallery",
      palette: "#d8cdbb",
      gridWidth: 6,
      gridHeight: 5,
      props: [{ id: "prop-1", kind: "framed-work", x: 1, y: 0, tone: "#2d2a26" }],
    },
    sort_order: 0,
    version: 1,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function baseTownRow(overrides: Partial<TownRow> = {}): TownRow {
  return {
    id: "town-1",
    slug: "the-creative-quarter",
    name: "The Creative Quarter",
    publication_status: "published",
    created_by: "user-1",
    version: 1,
    published_at: "2026-01-01T00:00:00Z",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("convertMemberRow", () => {
  it("converts a well-formed row into a Member", () => {
    const member = convertMemberRow(baseRow());
    expect(member).toEqual({
      id: "member-1",
      name: "Papermoth Press",
      category: "art",
      tagline: "Risograph prints.",
      description: "A print studio.",
      action: { id: "action-1", label: "Visit", url: "https://papermoth.example/visit" },
      building: {
        id: "building-1",
        exterior: "press-front",
        position: 0,
        bodyColor: "#c97b5f",
        trimColor: "#f3e3c8",
        signText: "Papermoth Press",
      },
      room: {
        template: "gallery",
        palette: "#d8cdbb",
        gridWidth: 6,
        gridHeight: 5,
        props: [{ id: "prop-1", kind: "framed-work", x: 1, y: 0, tone: "#2d2a26" }],
      },
    });
  });

  it("uses sort_order as the building's street position", () => {
    const member = convertMemberRow(baseRow({ sort_order: 3 }));
    expect(member?.building.position).toBe(3);
  });

  it("drops a row with an invalid category rather than crash", () => {
    expect(convertMemberRow(baseRow({ category: "not-a-real-category" }))).toBeNull();
  });

  it("drops a row with a missing id", () => {
    expect(convertMemberRow(baseRow({ id: "" }))).toBeNull();
  });

  it("drops a row whose building JSON is not an object", () => {
    expect(convertMemberRow(baseRow({ building: "not-json" }))).toBeNull();
  });

  it("drops a row whose building has no recognized exterior kind", () => {
    expect(convertMemberRow(baseRow({ building: { id: "b1", exterior: "haunted-house" } }))).toBeNull();
  });

  it("falls back to safe defaults for a building with bad colour fields, keeping the rest", () => {
    const member = convertMemberRow(
      baseRow({ building: { id: "b1", exterior: "press-front", bodyColor: "not-a-colour", trimColor: 42 } }),
    );
    expect(member).not.toBeNull();
    expect(member?.building.bodyColor).toBe("#b7a888");
    expect(member?.building.trimColor).toBe("#f3e3c8");
  });

  it("drops a row whose room JSON is not an object", () => {
    expect(convertMemberRow(baseRow({ room: null }))).toBeNull();
  });

  it("drops a row with an unrecognized interior template", () => {
    expect(convertMemberRow(baseRow({ room: { template: "dungeon", gridWidth: 6, gridHeight: 5, props: [] } }))).toBeNull();
  });

  it("drops a row with a non-positive grid dimension", () => {
    expect(
      convertMemberRow(baseRow({ room: { template: "gallery", gridWidth: 0, gridHeight: 5, props: [] } })),
    ).toBeNull();
  });

  it("drops individual invalid props but keeps the room and its valid props", () => {
    const member = convertMemberRow(
      baseRow({
        room: {
          template: "gallery",
          gridWidth: 6,
          gridHeight: 5,
          props: [
            { id: "good", kind: "framed-work", x: 0, y: 0, tone: "#2d2a26" },
            { id: "bad-kind", kind: "not-a-kind", x: 1, y: 0, tone: "#2d2a26" },
            { id: "bad-tone", kind: "plant", x: 2, y: 0, tone: "not-a-colour" },
            { kind: "plant", x: 3, y: 0, tone: "#2d2a26" }, // missing id
          ],
        },
      }),
    );
    expect(member?.room.props).toEqual([{ id: "good", kind: "framed-work", x: 0, y: 0, tone: "#2d2a26" }]);
  });

  it("treats missing optional prop content as absent, not a crash", () => {
    const member = convertMemberRow(
      baseRow({
        room: {
          template: "gallery",
          gridWidth: 6,
          gridHeight: 5,
          props: [{ id: "p1", kind: "plant", x: 0, y: 0, tone: "#2d2a26" }],
        },
      }),
    );
    expect(member?.room.props[0]?.content).toBeUndefined();
  });

  it("rejects an unsafe action URL and falls back to an inert link", () => {
    const member = convertMemberRow(baseRow({ action: { id: "a1", label: "Run script", url: "javascript:alert(1)" } }));
    expect(member?.action).toEqual({ id: "", label: "", url: "" });
  });

  it("accepts a safe mailto: action URL", () => {
    const member = convertMemberRow(baseRow({ action: { id: "a1", label: "Email", url: "mailto:hello@papermoth.example" } }));
    expect(member?.action.url).toBe("mailto:hello@papermoth.example");
  });

  it("falls back to an inert link when action JSON is malformed", () => {
    const member = convertMemberRow(baseRow({ action: "not-json" }));
    expect(member?.action).toEqual({ id: "", label: "", url: "" });
  });
});

describe("convertPublicMemberRow", () => {
  it("carries the slug through for a valid row", () => {
    const member = convertPublicMemberRow(baseRow({ slug: "papermoth-press" }));
    expect(member?.slug).toBe("papermoth-press");
  });

  it("drops a row with a blank slug even if the rest is valid", () => {
    expect(convertPublicMemberRow(baseRow({ slug: "" }))).toBeNull();
  });

  it("returns null when the underlying member row is invalid", () => {
    expect(convertPublicMemberRow(baseRow({ category: "bogus" }))).toBeNull();
  });
});

describe("convertTownRow", () => {
  it("builds a Town from a row and its converted members", () => {
    const member = convertPublicMemberRow(baseRow());
    const town = convertTownRow(baseTownRow(), member ? [member] : []);
    expect(town).toEqual({
      id: "town-1",
      slug: "the-creative-quarter",
      name: "The Creative Quarter",
      publicationStatus: "published",
      members: [member],
    });
  });

  it("preserves draft status", () => {
    const town = convertTownRow(baseTownRow({ publication_status: "draft", published_at: null }), []);
    expect(town.publicationStatus).toBe("draft");
  });
});
