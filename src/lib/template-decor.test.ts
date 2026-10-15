import { describe, expect, it } from "vitest";
import { DEMO_TOWN } from "./demo-data";
import { createProp, moveProp } from "./room-edit";
import {
  findFreeLayout,
  findFreeWallSpan,
  galleryWorkCornerLayouts,
  papermothPlantLayouts,
  papermothStorageLayouts,
  papermothWorkbenchLayouts,
  shopCounterLayouts,
  studioCrateLayouts,
  studioPegboardSpans,
  type GridRect,
} from "./template-decor";
import type { Room } from "./types";

function overlaps(a: GridRect, b: GridRect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function member(id: string) {
  const found = DEMO_TOWN.members.find((m) => m.id === id);
  if (!found) throw new Error(`fixture member ${id} missing from demo data`);
  return found;
}

const emptyRoom: Pick<Room, "props" | "gridWidth" | "gridHeight"> = { props: [], gridWidth: 6, gridHeight: 5 };

describe("findFreeLayout", () => {
  it("picks the first layout when nothing occupies it", () => {
    const layouts: GridRect[][] = [[{ x: 1, y: 1, w: 1, h: 1 }], [{ x: 3, y: 1, w: 1, h: 1 }]];
    expect(findFreeLayout(emptyRoom, layouts)).toEqual(layouts[0]);
  });

  it("falls back to the next layout when a floor prop occupies the first", () => {
    const room = { ...emptyRoom, props: [{ id: "p1", kind: "plant" as const, x: 1, y: 1, tone: "#000" }] };
    const layouts: GridRect[][] = [[{ x: 1, y: 1, w: 1, h: 1 }], [{ x: 3, y: 1, w: 1, h: 1 }]];
    expect(findFreeLayout(room, layouts)).toEqual(layouts[1]);
  });

  it("returns null when every layout collides", () => {
    const room = {
      ...emptyRoom,
      props: [
        { id: "p1", kind: "plant" as const, x: 1, y: 1, tone: "#000" },
        { id: "p2", kind: "plant" as const, x: 3, y: 1, tone: "#000" },
      ],
    };
    const layouts: GridRect[][] = [[{ x: 1, y: 1, w: 1, h: 1 }], [{ x: 3, y: 1, w: 1, h: 1 }]];
    expect(findFreeLayout(room, layouts)).toBeNull();
  });

  it("skips a candidate that would fall outside the room's grid", () => {
    const layouts: GridRect[][] = [[{ x: 5.5, y: 1, w: 1, h: 1 }], [{ x: 2, y: 1, w: 1, h: 1 }]];
    expect(findFreeLayout(emptyRoom, layouts)).toEqual(layouts[1]);
  });

  it("requires every rect in a composite layout to be free, not just one", () => {
    const room = { ...emptyRoom, props: [{ id: "p1", kind: "plant" as const, x: 3, y: 1, tone: "#000" }] };
    const layouts: GridRect[][] = [
      [
        { x: 1, y: 1, w: 1, h: 1 },
        { x: 3, y: 1, w: 1, h: 1 },
      ],
      [{ x: 1, y: 3, w: 1, h: 1 }],
    ];
    expect(findFreeLayout(room, layouts)).toEqual(layouts[1]);
  });

  it("ignores wall-mounted props — they never block floor decor", () => {
    const room = { ...emptyRoom, props: [{ id: "p1", kind: "framed-work" as const, x: 1, y: 1, tone: "#000" }] };
    const layouts: GridRect[][] = [[{ x: 1, y: 1, w: 1, h: 1 }]];
    expect(findFreeLayout(room, layouts)).toEqual(layouts[0]);
  });
});

describe("findFreeWallSpan", () => {
  it("picks the first span clear of every wall prop", () => {
    const room = { props: [{ id: "p1", kind: "framed-work" as const, x: 0, y: 0, tone: "#000" }], gridWidth: 6 };
    const spans = [
      { u0: 0, u1: 1 },
      { u0: 3, u1: 4 },
    ];
    expect(findFreeWallSpan(room, spans)).toEqual(spans[1]);
  });

  it("returns null when every span is occupied or out of bounds", () => {
    const room = { props: [{ id: "p1", kind: "framed-work" as const, x: 3, y: 0, tone: "#000" }], gridWidth: 6 };
    const spans = [
      { u0: 3, u1: 4 },
      { u0: 6, u1: 7 },
    ];
    expect(findFreeWallSpan(room, spans)).toBeNull();
  });

  it("ignores floor props — they never block wall decor", () => {
    const room = { props: [{ id: "p1", kind: "plant" as const, x: 3, y: 0, tone: "#000" }], gridWidth: 6 };
    const spans = [{ u0: 3, u1: 4 }];
    expect(findFreeWallSpan(room, spans)).toEqual(spans[0]);
  });
});

describe("decor placement against real demo rooms", () => {
  it("every decor kind finds its default spot in the untouched demo data", () => {
    const birch = member("birch-and-vellum-studio");
    const galleryLayouts = galleryWorkCornerLayouts(birch.room.gridWidth, birch.room.gridHeight);
    expect(findFreeLayout(birch.room, galleryLayouts)).toEqual(galleryLayouts[0]);

    const linden = member("linden-and-kiln");
    const crateLayouts = studioCrateLayouts(linden.room.gridWidth, linden.room.gridHeight);
    expect(findFreeLayout(linden.room, crateLayouts)).toEqual(crateLayouts[0]);
    const pegSpans = studioPegboardSpans(linden.room.gridWidth);
    expect(findFreeWallSpan(linden.room, pegSpans)).toEqual(pegSpans[0]);

    const harbor = member("harbor-light-goods");
    const counterLayouts = shopCounterLayouts(harbor.room.gridWidth, harbor.room.gridHeight);
    expect(findFreeLayout(harbor.room, counterLayouts)).toEqual(counterLayouts[0]);
  });

  it("falls back to a different gallery corner after dragging a prop onto the default one", () => {
    const birch = member("birch-and-vellum-studio");
    const layouts = galleryWorkCornerLayouts(birch.room.gridWidth, birch.room.gridHeight);
    const defaultSpot = layouts[0]!;
    const target = defaultSpot[0]!;
    const lamp = birch.room.props.find((p) => p.id === "birch-lamp");
    if (!lamp) throw new Error("fixture prop birch-lamp missing");

    const movedProps = moveProp(
      birch.room.props,
      "birch-lamp",
      target.x - lamp.x,
      target.y - lamp.y,
      birch.room.gridWidth,
      birch.room.gridHeight,
    );
    const room = { ...birch.room, props: movedProps };
    const resolved = findFreeLayout(room, layouts);

    expect(resolved).not.toEqual(defaultSpot);
    if (resolved) {
      const movedLamp = movedProps.find((p) => p.id === "birch-lamp")!;
      const lampRect = { x: movedLamp.x, y: movedLamp.y, w: 1, h: 1 };
      for (const rect of resolved) expect(overlaps(rect, lampRect)).toBe(false);
    }
  });

  it("omits the gallery work corner entirely once every candidate spot is blocked", () => {
    const birch = member("birch-and-vellum-studio");
    const layouts = galleryWorkCornerLayouts(birch.room.gridWidth, birch.room.gridHeight);
    const props = [
      ...birch.room.props,
      ...layouts.map((layout, i) => ({ id: `blocker-${i}`, kind: "plant" as const, x: layout[0]!.x, y: layout[0]!.y, tone: "#000" })),
    ];
    const room = { ...birch.room, props };
    expect(findFreeLayout(room, layouts)).toBeNull();
  });

  it("a newly added prop dragged onto the studio crate's default spot forces a fallback", () => {
    const linden = member("linden-and-kiln");
    const layouts = studioCrateLayouts(linden.room.gridWidth, linden.room.gridHeight);
    const defaultSpot = layouts[0]!;
    const target = defaultSpot[0]!;

    const added = createProp(linden.room, "plant", "test-member");
    const placed = moveProp(
      [...linden.room.props, added],
      added.id,
      target.x - added.x,
      target.y - added.y,
      linden.room.gridWidth,
      linden.room.gridHeight,
    );
    const room = { ...linden.room, props: placed };
    const resolved = findFreeLayout(room, layouts);

    expect(resolved).not.toEqual(defaultSpot);
    if (resolved) {
      const newProp = placed.find((p) => p.id === added.id)!;
      const rect = { x: newProp.x, y: newProp.y, w: 1, h: 1 };
      for (const r of resolved) expect(overlaps(r, rect)).toBe(false);
    }
  });

  it("a newly added wall prop dragged onto the pegboard's default span forces a fallback", () => {
    const linden = member("linden-and-kiln");
    const spans = studioPegboardSpans(linden.room.gridWidth);
    const defaultSpan = spans[0]!;

    const added = createProp(linden.room, "framed-work", "test-member");
    const placed = moveProp(
      [...linden.room.props, added],
      added.id,
      defaultSpan.u0 + 0.05 - added.x,
      0 - added.y,
      linden.room.gridWidth,
      linden.room.gridHeight,
    );
    const room = { ...linden.room, props: placed };
    const resolved = findFreeWallSpan(room, spans);

    expect(resolved).not.toEqual(defaultSpan);
    if (resolved) {
      const newProp = placed.find((p) => p.id === added.id)!;
      const newSpan = { u0: newProp.x, u1: newProp.x + 1 };
      expect(resolved.u0 < newSpan.u1 && resolved.u1 > newSpan.u0).toBe(false);
    }
  });

  it("falls back for the shop counter composite when a prop is dragged into its footprint", () => {
    const harbor = member("harbor-light-goods");
    const layouts = shopCounterLayouts(harbor.room.gridWidth, harbor.room.gridHeight);
    const defaultSpot = layouts[0]!;
    const counterRect = defaultSpot[0]!;
    const rug = harbor.room.props.find((p) => p.id === "harbor-rug");
    if (!rug) throw new Error("fixture prop harbor-rug missing");

    const movedProps = moveProp(
      harbor.room.props,
      "harbor-rug",
      counterRect.x - rug.x,
      counterRect.y - rug.y,
      harbor.room.gridWidth,
      harbor.room.gridHeight,
    );
    const room = { ...harbor.room, props: movedProps };
    const resolved = findFreeLayout(room, layouts);

    expect(resolved).not.toEqual(defaultSpot);
    if (resolved) {
      const movedRug = movedProps.find((p) => p.id === "harbor-rug")!;
      const rugRect = { x: movedRug.x, y: movedRug.y, w: 2, h: 2 };
      for (const rect of resolved) expect(overlaps(rect, rugRect)).toBe(false);
    }
  });
});

describe("Papermoth print-studio corner placement", () => {
  const papermoth = member("papermoth-press");

  it("every piece finds its original spot in the untouched demo room", () => {
    const { gridWidth, gridHeight } = papermoth.room;
    expect(findFreeLayout(papermoth.room, papermothWorkbenchLayouts(gridWidth, gridHeight))).toEqual(
      papermothWorkbenchLayouts(gridWidth, gridHeight)[0],
    );
    expect(findFreeLayout(papermoth.room, papermothStorageLayouts(gridWidth, gridHeight))).toEqual(
      papermothStorageLayouts(gridWidth, gridHeight)[0],
    );
    expect(findFreeLayout(papermoth.room, papermothPlantLayouts(gridWidth, gridHeight))).toEqual(
      papermothPlantLayouts(gridWidth, gridHeight)[0],
    );
  });

  it("falls back to a different spot after dragging a prop onto the workbench's default footprint", () => {
    const layouts = papermothWorkbenchLayouts(papermoth.room.gridWidth, papermoth.room.gridHeight);
    const defaultSpot = layouts[0]!;
    const target = defaultSpot[0]!;
    const lamp = papermoth.room.props.find((p) => p.id === "papermoth-lamp");
    if (!lamp) throw new Error("fixture prop papermoth-lamp missing");

    const movedProps = moveProp(
      papermoth.room.props,
      "papermoth-lamp",
      target.x - lamp.x,
      target.y - lamp.y,
      papermoth.room.gridWidth,
      papermoth.room.gridHeight,
    );
    const room = { ...papermoth.room, props: movedProps };
    const resolved = findFreeLayout(room, layouts);

    expect(resolved).not.toEqual(defaultSpot);
    if (resolved) {
      const movedLamp = movedProps.find((p) => p.id === "papermoth-lamp")!;
      const lampRect = { x: movedLamp.x, y: movedLamp.y, w: 1, h: 1 };
      for (const rect of resolved) expect(overlaps(rect, lampRect)).toBe(false);
    }
  });

  it("falls back for the storage unit when a newly added prop is dragged onto its default footprint", () => {
    const layouts = papermothStorageLayouts(papermoth.room.gridWidth, papermoth.room.gridHeight);
    const defaultSpot = layouts[0]!;
    const target = defaultSpot[0]!;

    const added = createProp(papermoth.room, "plant", "test-member");
    const placed = moveProp(
      [...papermoth.room.props, added],
      added.id,
      target.x - added.x,
      target.y - added.y,
      papermoth.room.gridWidth,
      papermoth.room.gridHeight,
    );
    const room = { ...papermoth.room, props: placed };
    const resolved = findFreeLayout(room, layouts);

    expect(resolved).not.toEqual(defaultSpot);
    if (resolved) {
      const newProp = placed.find((p) => p.id === added.id)!;
      const rect = { x: newProp.x, y: newProp.y, w: 1, h: 1 };
      for (const r of resolved) expect(overlaps(r, rect)).toBe(false);
    }
  });

  it("falls back for the accent plant after dragging a prop onto its default spot", () => {
    const layouts = papermothPlantLayouts(papermoth.room.gridWidth, papermoth.room.gridHeight);
    const defaultSpot = layouts[0]!;
    const target = defaultSpot[0]!;
    const plant = papermoth.room.props.find((p) => p.id === "papermoth-plant");
    if (!plant) throw new Error("fixture prop papermoth-plant missing");

    const movedProps = moveProp(
      papermoth.room.props,
      "papermoth-plant",
      target.x - plant.x,
      target.y - plant.y,
      papermoth.room.gridWidth,
      papermoth.room.gridHeight,
    );
    const room = { ...papermoth.room, props: movedProps };
    const resolved = findFreeLayout(room, layouts);

    expect(resolved).not.toEqual(defaultSpot);
    if (resolved) {
      const movedPlant = movedProps.find((p) => p.id === "papermoth-plant")!;
      const plantRect = { x: movedPlant.x, y: movedPlant.y, w: 1, h: 1 };
      for (const r of resolved) expect(overlaps(r, plantRect)).toBe(false);
    }
  });

  it("omits the workbench entirely once every one of its candidate spots is blocked", () => {
    const layouts = papermothWorkbenchLayouts(papermoth.room.gridWidth, papermoth.room.gridHeight);
    const props = [
      ...papermoth.room.props,
      ...layouts.map((layout, i) => ({ id: `blocker-${i}`, kind: "bench" as const, x: layout[0]!.x, y: layout[0]!.y, tone: "#000" })),
    ];
    const room = { ...papermoth.room, props };
    expect(findFreeLayout(room, layouts)).toBeNull();
  });

  it("resolves the three pieces independently — blocking the workbench alone doesn't take down the storage or the plant", () => {
    const workbenchLayouts = papermothWorkbenchLayouts(papermoth.room.gridWidth, papermoth.room.gridHeight);
    const props = [
      ...papermoth.room.props,
      ...workbenchLayouts.map((layout, i) => ({ id: `blocker-${i}`, kind: "bench" as const, x: layout[0]!.x, y: layout[0]!.y, tone: "#000" })),
    ];
    const room = { ...papermoth.room, props };

    expect(findFreeLayout(room, workbenchLayouts)).toBeNull();
    expect(findFreeLayout(room, papermothStorageLayouts(room.gridWidth, room.gridHeight))).toEqual(
      papermothStorageLayouts(room.gridWidth, room.gridHeight)[0],
    );
    expect(findFreeLayout(room, papermothPlantLayouts(room.gridWidth, room.gridHeight))).toEqual(
      papermothPlantLayouts(room.gridWidth, room.gridHeight)[0],
    );
  });
});
