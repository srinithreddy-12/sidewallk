import { PROP_REGISTRY } from "./prop-registry";
import type { Room, RoomProp } from "./types";

/**
 * Pure geometry behind TemplateDecor's fixed set dressing. Decor is never
 * part of the persisted room — it is recomputed on every render from the
 * room's *current* props, so a prop the editor moved or added always wins
 * over a decor piece: decor falls back to an alternate spot, or omits
 * itself entirely, rather than ever being drawn on top of an editable prop.
 */

export interface GridRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WallSpan {
  u0: number;
  u1: number;
}

type RoomLike = Pick<Room, "props" | "gridWidth" | "gridHeight">;

function floorFootprints(props: RoomProp[]): GridRect[] {
  return props
    .filter((prop) => PROP_REGISTRY[prop.kind].mount === "floor")
    .map((prop) => {
      const { w, h } = PROP_REGISTRY[prop.kind].footprint;
      return { x: prop.x, y: prop.y, w, h };
    });
}

function wallSpans(props: RoomProp[]): WallSpan[] {
  return props
    .filter((prop) => PROP_REGISTRY[prop.kind].mount === "wall")
    .map((prop) => ({ u0: prop.x, u1: prop.x + PROP_REGISTRY[prop.kind].footprint.w }));
}

function rectsOverlap(a: GridRect, b: GridRect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function spansOverlap(a: WallSpan, b: WallSpan): boolean {
  return a.u0 < b.u1 && a.u1 > b.u0;
}

function inBounds(rect: GridRect, gridWidth: number, gridHeight: number): boolean {
  return rect.x >= 0 && rect.y >= 0 && rect.x + rect.w <= gridWidth && rect.y + rect.h <= gridHeight;
}

/**
 * Tries each candidate layout (a group of rects that must land together, or
 * just one) in priority order and returns the first whose every rect is
 * in-bounds and clear of every floor prop currently in the room. Returns
 * null when nothing fits — the caller must then render no decor at all
 * rather than overlap an editable prop.
 */
export function findFreeLayout(room: RoomLike, layouts: GridRect[][]): GridRect[] | null {
  const occupied = floorFootprints(room.props);
  layoutLoop: for (const layout of layouts) {
    for (const rect of layout) {
      if (!inBounds(rect, room.gridWidth, room.gridHeight)) continue layoutLoop;
      if (occupied.some((o) => rectsOverlap(rect, o))) continue layoutLoop;
    }
    return layout;
  }
  return null;
}

/** Same idea as `findFreeLayout`, for a wall-mounted span measured only in u (mount height is fixed per decor piece, so only horizontal overlap against other wall props matters). */
export function findFreeWallSpan(room: Pick<Room, "props" | "gridWidth">, candidates: WallSpan[]): WallSpan | null {
  const occupied = wallSpans(room.props);
  for (const candidate of candidates) {
    if (candidate.u0 < 0 || candidate.u1 > room.gridWidth) continue;
    if (occupied.some((o) => spansOverlap(candidate, o))) continue;
    return candidate;
  }
  return null;
}

/** Candidate spots for the gallery print/work corner, original position first, then the opposite wall side, then both front corners. */
export function galleryWorkCornerLayouts(gridWidth: number, gridHeight: number): GridRect[][] {
  const w = 1.6;
  const h = 0.95;
  const backY = 0.35;
  const frontY = Math.max(backY, gridHeight - h - 0.3);
  return [
    [{ x: gridWidth - w - 0.25, y: backY, w, h }],
    [{ x: 0.25, y: backY, w, h }],
    [{ x: gridWidth - w - 0.25, y: frontY, w, h }],
    [{ x: 0.25, y: frontY, w, h }],
  ];
}

/** Candidate spots for the studio materials crate: original, then the opposite side, then centred toward the front. */
export function studioCrateLayouts(gridWidth: number, gridHeight: number): GridRect[][] {
  const w = 1.1;
  const h = 0.8;
  const backY = 0.35;
  const frontY = Math.max(backY, gridHeight - h - 0.3);
  const centerX = Math.max(0, gridWidth / 2 - w / 2);
  return [
    [{ x: 2.3, y: backY, w, h }],
    [{ x: Math.max(0.3, gridWidth - w - 0.3), y: backY, w, h }],
    [{ x: 0.3, y: backY, w, h }],
    [{ x: centerX, y: frontY, w, h }],
  ];
}

/** Candidate wall spans for the studio tool pegboard: the gap just right of centre the demo layout leaves, then each side edge. */
export function studioPegboardSpans(gridWidth: number): WallSpan[] {
  const span = 0.9;
  return [
    { u0: gridWidth / 2 + 0.05, u1: gridWidth / 2 + 0.05 + span },
    { u0: 0.05, u1: 0.05 + span },
    { u0: Math.max(0.05 + span, gridWidth - span - 0.05), u1: gridWidth - 0.05 },
  ];
}

/** Candidate spots for Papermoth's own print workbench: original back-right corner, then mirrored to back-left, then pushed toward the front at whichever side it landed. */
export function papermothWorkbenchLayouts(gridWidth: number, gridHeight: number): GridRect[][] {
  const w = 1.7;
  const h = 1.0;
  const backY = 0.35;
  const margin = 0.15;
  const frontY = Math.max(backY, gridHeight - h - 0.3);
  return [
    [{ x: gridWidth - w - margin, y: backY, w, h }],
    [{ x: margin, y: backY, w, h }],
    [{ x: gridWidth - w - margin, y: frontY, w, h }],
  ];
}

/** Candidate spots for Papermoth's flat-file print storage: same priority order as the workbench, independent of whether the workbench itself found a spot. */
export function papermothStorageLayouts(gridWidth: number, gridHeight: number): GridRect[][] {
  const w = 1.15;
  const h = 0.85;
  const backY = 1.65;
  const margin = 0.65;
  const frontY = Math.max(backY, gridHeight - h - 0.3);
  return [
    [{ x: gridWidth - w - margin, y: backY, w, h }],
    [{ x: margin, y: backY, w, h }],
    [{ x: gridWidth - w - margin, y: frontY, w, h }],
  ];
}

/** Candidate spots for Papermoth's accent plant, as a small rect around its centre point — same priority order as the other two pieces, resolved independently. */
export function papermothPlantLayouts(gridWidth: number, gridHeight: number): GridRect[][] {
  const w = 0.26;
  const h = 0.26;
  const backY = 2.22;
  const margin = 0.17;
  const frontY = Math.max(backY, gridHeight - h - 0.3);
  return [
    [{ x: gridWidth - w - margin, y: backY, w, h }],
    [{ x: margin, y: backY, w, h }],
    [{ x: gridWidth - w - margin, y: frontY, w, h }],
  ];
}

/**
 * Candidate layouts for the shop counter plus its two packaging boxes,
 * tried as one composite unit so the pieces always land together: the
 * original mid-room spot, then shifted back toward the rear wall, then
 * shifted toward the left wall.
 */
export function shopCounterLayouts(gridWidth: number, gridHeight: number): GridRect[][] {
  const counterW = 1.7;
  const counterH = 0.75;
  const box1 = { w: 0.42, h: 0.42 };
  const box2 = { w: 0.34, h: 0.34 };

  function group(counterX: number, counterY: number): GridRect[] {
    const boxBaseX = counterX - 0.7;
    return [
      { x: counterX, y: counterY, w: counterW, h: counterH },
      { x: boxBaseX, y: counterY + 0.05, w: box1.w, h: box1.h },
      { x: boxBaseX + 0.05, y: counterY + 0.51, w: box2.w, h: box2.h },
    ];
  }

  const midX = Math.max(0.3, gridWidth / 2 - counterW / 2);
  const backY = 0.3;
  const midY = Math.min(backY + 0.8, Math.max(backY, gridHeight - counterH - 0.3));

  return [group(midX, midY), group(midX, backY), group(Math.max(0.3, midX - 1), midY)];
}
