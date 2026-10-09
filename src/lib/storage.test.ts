import { describe, expect, it } from "vitest";
import { DEMO_TOWN } from "./demo-data";
import {
  applyOverride,
  mergeOverride,
  parseStoredOverrides,
  serializeOverrides,
  STORAGE_KEY,
} from "./storage";
import type { MemberOverride, OverrideMap, RoomProp } from "./types";

const demoMember = DEMO_TOWN.members[0];
if (!demoMember) throw new Error("demo town must have at least one member");

describe("parseStoredOverrides", () => {
  it("returns an empty map for null input", () => {
    expect(parseStoredOverrides(null)).toEqual({});
  });

  it("returns an empty map for unparseable JSON", () => {
    expect(parseStoredOverrides("{not json")).toEqual({});
  });

  it("returns an empty map for a wrong version", () => {
    const raw = JSON.stringify({ version: 999, overrides: { x: { name: "y" } } });
    expect(parseStoredOverrides(raw)).toEqual({});
  });

  it("round-trips a valid override", () => {
    const overrides: OverrideMap = {
      [demoMember.id]: { name: "New Name", tagline: "New tagline" },
    };
    const raw = serializeOverrides(overrides);
    expect(parseStoredOverrides(raw)).toEqual(overrides);
  });

  it("drops a javascript: link but keeps the rest of the override", () => {
    const raw = JSON.stringify({
      version: 1,
      overrides: {
        [demoMember.id]: {
          name: "Still kept",
          action: { id: "a", label: "Click", url: "javascript:alert(1)" },
        },
      },
    });
    const result = parseStoredOverrides(raw);
    expect(result[demoMember.id]?.name).toBe("Still kept");
    expect(result[demoMember.id]?.action).toBeUndefined();
  });

  it("drops a prop with an unknown kind but keeps valid props", () => {
    const goodProp: RoomProp = { id: "p1", kind: "plant", x: 0, y: 0, tone: "#112233" };
    const raw = JSON.stringify({
      version: 1,
      overrides: {
        [demoMember.id]: {
          room: {
            props: [goodProp, { id: "p2", kind: "not-a-real-kind", x: 1, y: 1, tone: "#000000" }],
          },
        },
      },
    });
    const result = parseStoredOverrides(raw);
    expect(result[demoMember.id]?.room?.props).toEqual([goodProp]);
  });

  it("drops an entire malformed member override but keeps siblings", () => {
    const raw = JSON.stringify({
      version: 1,
      overrides: {
        [demoMember.id]: { name: "Kept Member" },
        "broken-member": "not an object",
      },
    });
    const result = parseStoredOverrides(raw);
    expect(Object.keys(result)).toEqual([demoMember.id]);
  });
});

describe("mergeOverride", () => {
  it("merges a patch onto nothing", () => {
    const patch: MemberOverride = { name: "A" };
    expect(mergeOverride(undefined, patch)).toEqual({ name: "A", building: undefined, room: undefined });
  });

  it("merges building fields without clobbering untouched ones", () => {
    const existing: MemberOverride = { building: { bodyColor: "#111111", signText: "Old" } };
    const patch: MemberOverride = { building: { bodyColor: "#222222" } };
    const merged = mergeOverride(existing, patch);
    expect(merged.building).toEqual({ bodyColor: "#222222", signText: "Old" });
  });

  it("replaces the full prop list rather than merging prop arrays", () => {
    const propA: RoomProp = { id: "a", kind: "plant", x: 0, y: 0, tone: "#000000" };
    const propB: RoomProp = { id: "b", kind: "lamp", x: 1, y: 1, tone: "#111111" };
    const existing: MemberOverride = { room: { props: [propA] } };
    const patch: MemberOverride = { room: { props: [propB] } };
    expect(mergeOverride(existing, patch).room?.props).toEqual([propB]);
  });
});

describe("applyOverride", () => {
  it("returns the member unchanged when there is no override", () => {
    expect(applyOverride(demoMember, undefined)).toBe(demoMember);
  });

  it("layers an override on top of demo data without mutating it", () => {
    const override: MemberOverride = { name: "Renamed" };
    const result = applyOverride(demoMember, override);
    expect(result.name).toBe("Renamed");
    expect(result.description).toBe(demoMember.description);
    expect(demoMember.name).not.toBe("Renamed");
  });

  it("falls back to demo props when the override never touched the room", () => {
    const result = applyOverride(demoMember, { name: "Renamed" });
    expect(result.room.props).toBe(demoMember.room.props);
  });
});

it("storage key is namespaced and versioned", () => {
  expect(STORAGE_KEY).toBe("sidewallk.town.v1");
});
