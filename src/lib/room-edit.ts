import { DEFAULT_PROP_TONE, PROP_REGISTRY } from "./prop-registry";
import type { Room, RoomProp, RoomPropKind } from "./types";

function cellTaken(props: RoomProp[], x: number, y: number, mount: "floor" | "wall"): boolean {
  return props.some((p) => {
    const def = PROP_REGISTRY[p.kind];
    if (def.mount !== mount) return false;
    return p.x === x && p.y === y;
  });
}

/** Finds the first free grid cell for a new prop of `kind`, scanning left-to-right, back-to-front. */
function findOpenSlot(room: Pick<Room, "gridWidth" | "gridHeight" | "props">, kind: RoomPropKind): { x: number; y: number } {
  const def = PROP_REGISTRY[kind];
  const maxX = Math.max(0, room.gridWidth - def.footprint.w);
  const maxY = def.mount === "wall" ? 0 : Math.max(0, room.gridHeight - def.footprint.h);
  const startY = def.mount === "wall" ? 0 : 1;

  for (let y = startY; y <= maxY; y++) {
    for (let x = 0; x <= maxX; x++) {
      if (!cellTaken(room.props, x, y, def.mount)) {
        return { x, y };
      }
    }
  }
  return { x: 0, y: startY };
}

let nextPropSuffix = 0;

/** Builds a new prop of `kind` in the first open slot, ready to append to a room's prop list. */
export function createProp(
  room: Pick<Room, "gridWidth" | "gridHeight" | "props">,
  kind: RoomPropKind,
  idPrefix: string,
): RoomProp {
  const def = PROP_REGISTRY[kind];
  const { x, y } = findOpenSlot(room, kind);
  nextPropSuffix += 1;
  const prop: RoomProp = {
    id: `${idPrefix}-${kind}-${Date.now()}-${nextPropSuffix}`,
    kind,
    x,
    y,
    tone: DEFAULT_PROP_TONE[kind],
  };
  if (def.isDisplay) {
    prop.content = { title: "", description: "" };
  }
  return prop;
}

/** Moves a prop by (dx, dy), clamped to stay within the room grid and on its mount's y. */
export function moveProp(
  props: RoomProp[],
  propId: string,
  dx: number,
  dy: number,
  gridWidth: number,
  gridHeight: number,
): RoomProp[] {
  return props.map((prop) => {
    if (prop.id !== propId) return prop;
    const def = PROP_REGISTRY[prop.kind];
    const maxX = Math.max(0, gridWidth - def.footprint.w);
    const maxY = def.mount === "wall" ? 0 : Math.max(0, gridHeight - def.footprint.h);
    const minY = def.mount === "wall" ? 0 : 0;
    return {
      ...prop,
      x: Math.max(0, Math.min(maxX, prop.x + dx)),
      y: Math.max(minY, Math.min(maxY, prop.y + dy)),
    };
  });
}

export function removeProp(props: RoomProp[], propId: string): RoomProp[] {
  return props.filter((prop) => prop.id !== propId);
}

export function updatePropContent(
  props: RoomProp[],
  propId: string,
  patch: Partial<{ title: string; description: string; linkLabel: string; linkUrl: string }>,
): RoomProp[] {
  return props.map((prop) => {
    if (prop.id !== propId) return prop;
    const current = prop.content ?? { title: "", description: "" };
    const title = patch.title ?? current.title;
    const description = patch.description ?? current.description;
    const linkLabel = patch.linkLabel ?? current.link?.label ?? "";
    const linkUrl = patch.linkUrl ?? current.link?.url ?? "";
    const link = linkLabel && linkUrl ? { id: current.link?.id ?? `${propId}-link`, label: linkLabel, url: linkUrl } : undefined;
    return { ...prop, content: link ? { title, description, link } : { title, description } };
  });
}
