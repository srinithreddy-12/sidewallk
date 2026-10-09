import type { PropDefinition, RoomPropKind } from "./types";

export const PROP_REGISTRY: Record<RoomPropKind, PropDefinition> = {
  "framed-work": {
    kind: "framed-work",
    label: "Framed work",
    mount: "wall",
    isDisplay: true,
    footprint: { w: 1, h: 1 },
  },
  pedestal: {
    kind: "pedestal",
    label: "Pedestal",
    mount: "floor",
    isDisplay: true,
    footprint: { w: 1, h: 1 },
  },
  "shelf-display": {
    kind: "shelf-display",
    label: "Shelf display",
    mount: "wall",
    isDisplay: true,
    footprint: { w: 2, h: 1 },
  },
  "product-table": {
    kind: "product-table",
    label: "Product table",
    mount: "floor",
    isDisplay: true,
    footprint: { w: 2, h: 1 },
  },
  "booking-desk": {
    kind: "booking-desk",
    label: "Booking desk",
    mount: "floor",
    isDisplay: true,
    footprint: { w: 2, h: 1 },
  },
  plant: {
    kind: "plant",
    label: "Plant",
    mount: "floor",
    isDisplay: false,
    footprint: { w: 1, h: 1 },
  },
  rug: {
    kind: "rug",
    label: "Rug",
    mount: "floor",
    isDisplay: false,
    footprint: { w: 2, h: 2 },
  },
  lamp: {
    kind: "lamp",
    label: "Lamp",
    mount: "floor",
    isDisplay: false,
    footprint: { w: 1, h: 1 },
  },
  bench: {
    kind: "bench",
    label: "Bench",
    mount: "floor",
    isDisplay: false,
    footprint: { w: 2, h: 1 },
  },
};

export const DISPLAY_PROP_KINDS: RoomPropKind[] = Object.values(PROP_REGISTRY)
  .filter((def) => def.isDisplay)
  .map((def) => def.kind);

export const DECOR_PROP_KINDS: RoomPropKind[] = Object.values(PROP_REGISTRY)
  .filter((def) => !def.isDisplay)
  .map((def) => def.kind);

/** Props a template's room is allowed to add, in a sensible editor order. */
export const TEMPLATE_PROP_PALETTE: Record<string, RoomPropKind[]> = {
  gallery: ["framed-work", "pedestal", "plant", "bench", "rug", "lamp"],
  studio: ["shelf-display", "booking-desk", "framed-work", "plant", "rug", "lamp"],
  shop: ["product-table", "shelf-display", "plant", "rug", "lamp", "bench"],
};
