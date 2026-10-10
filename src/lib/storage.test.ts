import { afterEach, describe, expect, it, vi } from "vitest";
import { DEMO_TOWN } from "./demo-data";
import {
  applyOverride,
  loadOverrides,
  mergeOverride,
  parseStoredOverrides,
  removeOverride,
  saveOverrides,
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

  describe("intentional clearing survives a round trip (regression)", () => {
    it("preserves a cleared description instead of falling back to demo data", () => {
      const overrides: OverrideMap = { [demoMember.id]: { description: "" } };
      const raw = serializeOverrides(overrides);
      const result = parseStoredOverrides(raw);
      expect(result[demoMember.id]?.description).toBe("");
      expect("description" in (result[demoMember.id] ?? {})).toBe(true);
    });

    it("preserves a cleared name and tagline", () => {
      const overrides: OverrideMap = { [demoMember.id]: { name: "", tagline: "" } };
      const raw = serializeOverrides(overrides);
      const result = parseStoredOverrides(raw);
      expect(result[demoMember.id]).toEqual({ name: "", tagline: "" });
    });

    it("preserves a cleared action URL rather than dropping the whole action link", () => {
      const overrides: OverrideMap = {
        [demoMember.id]: { action: { id: "a", label: "Visit", url: "" } },
      };
      const raw = serializeOverrides(overrides);
      const result = parseStoredOverrides(raw);
      expect(result[demoMember.id]?.action).toEqual({ id: "a", label: "Visit", url: "" });
    });

    it("preserves artwork content with a title and an empty description, instead of discarding it", () => {
      const prop: RoomProp = {
        id: "p1",
        kind: "framed-work",
        x: 0,
        y: 0,
        tone: "#112233",
        content: { title: "Low Tide", description: "" },
      };
      const overrides: OverrideMap = { [demoMember.id]: { room: { props: [prop] } } };
      const raw = serializeOverrides(overrides);
      const result = parseStoredOverrides(raw);
      expect(result[demoMember.id]?.room?.props).toEqual([prop]);
    });

    it("still rejects a non-empty but unsafe action URL after the fix", () => {
      const raw = JSON.stringify({
        version: 1,
        overrides: {
          [demoMember.id]: { action: { id: "a", label: "Click", url: "javascript:alert(1)" } },
        },
      });
      const result = parseStoredOverrides(raw);
      expect(result[demoMember.id]?.action).toBeUndefined();
    });

    it("still rejects prop content where description is the wrong type, not just empty", () => {
      const raw = JSON.stringify({
        version: 1,
        overrides: {
          [demoMember.id]: {
            room: {
              props: [{ id: "p1", kind: "framed-work", x: 0, y: 0, tone: "#112233", content: { title: "X", description: 42 } }],
            },
          },
        },
      });
      const result = parseStoredOverrides(raw);
      expect(result[demoMember.id]?.room?.props?.[0]?.content).toBeUndefined();
    });
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

  it("changes the room template without clobbering an existing palette or props", () => {
    const propA: RoomProp = { id: "a", kind: "plant", x: 0, y: 0, tone: "#000000" };
    const existing: MemberOverride = { room: { template: "gallery", palette: "#d8cdbb", props: [propA] } };
    const patch: MemberOverride = { room: { template: "shop" } };
    const merged = mergeOverride(existing, patch);
    expect(merged.room).toEqual({ template: "shop", palette: "#d8cdbb", props: [propA] });
  });

  it("sets a room template for the first time onto an override with no prior room field", () => {
    const existing: MemberOverride = { name: "Renamed" };
    const patch: MemberOverride = { room: { template: "studio" } };
    const merged = mergeOverride(existing, patch);
    expect(merged.room).toEqual({ template: "studio", palette: undefined, props: undefined });
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

  it("applies an overridden room template", () => {
    const otherTemplate = demoMember.room.template === "gallery" ? "shop" : "gallery";
    const result = applyOverride(demoMember, { room: { template: otherTemplate } });
    expect(result.room.template).toBe(otherTemplate);
  });

  it("falls back to the demo template when the override never touched it", () => {
    const result = applyOverride(demoMember, { room: { palette: "#e4dac8" } });
    expect(result.room.template).toBe(demoMember.room.template);
  });
});

describe("removeOverride", () => {
  it("drops the named member's override and leaves others untouched", () => {
    const overrides: OverrideMap = {
      [demoMember.id]: { name: "Renamed" },
      "other-member": { name: "Also renamed" },
    };
    const result = removeOverride(overrides, demoMember.id);
    expect(result).toEqual({ "other-member": { name: "Also renamed" } });
  });

  it("round-trips through applyOverride back to the original demo member", () => {
    const overrides: OverrideMap = { [demoMember.id]: { name: "Renamed", room: { template: "shop" } } };
    const afterReset = removeOverride(overrides, demoMember.id);
    const result = applyOverride(demoMember, afterReset[demoMember.id]);
    expect(result).toBe(demoMember);
  });

  it("returns the same map reference when there is nothing to remove", () => {
    const overrides: OverrideMap = { "other-member": { name: "X" } };
    expect(removeOverride(overrides, demoMember.id)).toBe(overrides);
  });
});

describe("loadOverrides / saveOverrides", () => {
  function mockLocalStorage() {
    const store = new Map<string, string>();
    return {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    };
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("round-trips a save through to a fresh load, exercising real localStorage calls", () => {
    vi.stubGlobal("window", { localStorage: mockLocalStorage() });
    const overrides: OverrideMap = { [demoMember.id]: { name: "Persisted Name" } };

    expect(saveOverrides(overrides)).toEqual({ ok: true });
    expect(loadOverrides()).toEqual(overrides);
  });

  it("reset (save of the empty map) is visible on the next load", () => {
    vi.stubGlobal("window", { localStorage: mockLocalStorage() });
    saveOverrides({ [demoMember.id]: { name: "Will be reset" } });

    saveOverrides({});

    expect(loadOverrides()).toEqual({});
  });

  it("loadOverrides returns the empty map, never throws, when storage is unavailable", () => {
    vi.stubGlobal("window", {
      get localStorage(): never {
        throw new Error("storage blocked");
      },
    });
    expect(loadOverrides()).toEqual({});
  });

  it("saveOverrides reports failure, never throws, when storage is unavailable", () => {
    vi.stubGlobal("window", {
      get localStorage(): never {
        throw new Error("storage blocked");
      },
    });
    const status = saveOverrides({ [demoMember.id]: { name: "X" } });
    expect(status.ok).toBe(false);
  });
});

it("storage key is namespaced and versioned", () => {
  expect(STORAGE_KEY).toBe("sidewallk.town.v1");
});
