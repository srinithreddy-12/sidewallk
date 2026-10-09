import { describe, expect, it } from "vitest";
import { createProp, moveProp, removeProp, updatePropContent } from "./room-edit";
import type { Room, RoomProp } from "./types";

const emptyRoom: Pick<Room, "gridWidth" | "gridHeight" | "props"> = {
  gridWidth: 6,
  gridHeight: 5,
  props: [],
};

describe("createProp", () => {
  it("places a floor prop at the first open floor slot", () => {
    const prop = createProp(emptyRoom, "plant", "member-x");
    expect(prop.x).toBe(0);
    expect(prop.y).toBe(1);
    expect(prop.kind).toBe("plant");
  });

  it("gives display props empty content ready to be filled in", () => {
    const prop = createProp(emptyRoom, "pedestal", "member-x");
    expect(prop.content).toEqual({ title: "", description: "" });
  });

  it("gives decor props no content", () => {
    const prop = createProp(emptyRoom, "plant", "member-x");
    expect(prop.content).toBeUndefined();
  });

  it("skips a cell already taken by another prop on the same mount", () => {
    const taken: RoomProp = { id: "a", kind: "plant", x: 0, y: 1, tone: "#000" };
    const room = { ...emptyRoom, props: [taken] };
    const prop = createProp(room, "lamp", "member-x");
    expect(prop.x === 0 && prop.y === 1).toBe(false);
  });
});

describe("moveProp", () => {
  it("moves a floor prop within bounds", () => {
    const props: RoomProp[] = [{ id: "a", kind: "plant", x: 2, y: 2, tone: "#000" }];
    const moved = moveProp(props, "a", 1, 0, 6, 5);
    expect(moved[0]).toMatchObject({ x: 3, y: 2 });
  });

  it("clamps movement at the grid edge", () => {
    const props: RoomProp[] = [{ id: "a", kind: "plant", x: 0, y: 1, tone: "#000" }];
    const moved = moveProp(props, "a", -5, -5, 6, 5);
    expect(moved[0]).toMatchObject({ x: 0, y: 0 });
  });

  it("keeps wall props pinned to y = 0 regardless of vertical movement", () => {
    const props: RoomProp[] = [{ id: "a", kind: "framed-work", x: 1, y: 0, tone: "#000" }];
    const moved = moveProp(props, "a", 0, 3, 6, 5);
    expect(moved[0]).toMatchObject({ x: 1, y: 0 });
  });

  it("leaves other props untouched", () => {
    const props: RoomProp[] = [
      { id: "a", kind: "plant", x: 0, y: 1, tone: "#000" },
      { id: "b", kind: "lamp", x: 2, y: 2, tone: "#111" },
    ];
    const moved = moveProp(props, "a", 1, 0, 6, 5);
    expect(moved[1]).toEqual(props[1]);
  });
});

describe("removeProp", () => {
  it("removes only the targeted prop", () => {
    const props: RoomProp[] = [
      { id: "a", kind: "plant", x: 0, y: 1, tone: "#000" },
      { id: "b", kind: "lamp", x: 2, y: 2, tone: "#111" },
    ];
    expect(removeProp(props, "a")).toEqual([props[1]]);
  });
});

describe("updatePropContent", () => {
  it("sets title and description without a link", () => {
    const props: RoomProp[] = [{ id: "a", kind: "pedestal", x: 0, y: 1, tone: "#000", content: { title: "", description: "" } }];
    const updated = updatePropContent(props, "a", { title: "New title", description: "New description" });
    expect(updated[0]?.content).toEqual({ title: "New title", description: "New description" });
  });

  it("leaves the link unset when only a label is given", () => {
    const props: RoomProp[] = [{ id: "a", kind: "pedestal", x: 0, y: 1, tone: "#000", content: { title: "T", description: "D" } }];
    const partial = updatePropContent(props, "a", { linkLabel: "Visit" });
    expect(partial[0]?.content?.link).toBeUndefined();
  });

  it("attaches a link once both label and url are given together", () => {
    const props: RoomProp[] = [{ id: "a", kind: "pedestal", x: 0, y: 1, tone: "#000", content: { title: "T", description: "D" } }];
    const complete = updatePropContent(props, "a", { linkLabel: "Visit", linkUrl: "https://example.example" });
    expect(complete[0]?.content?.link).toMatchObject({ label: "Visit", url: "https://example.example" });
  });
});
