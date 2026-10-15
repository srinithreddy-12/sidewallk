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
 * in-bounds, clear of every floor prop currently in the room, and clear of
 * `extraOccupied` — rects a caller resolving several decor pieces as one
 * arrangement has already committed to for an earlier piece, so two pieces
 * can never both land on the same (or an overlapping) spot. Returns null
 * when nothing fits — the caller must then render no decor at all rather
 * than overlap an editable prop or another decor piece.
 */
export function findFreeLayout(room: RoomLike, layouts: GridRect[][], extraOccupied: GridRect[] = []): GridRect[] | null {
  const occupied = floorFootprints(room.props).concat(extraOccupied);
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

/**
 * Papermoth's own `papermoth-plant` demo prop sits at grid (0,2)–(1,3) and
 * is permanent (it's editable, not decor, but nothing moves it by default).
 * A pure mirror of the back-right cluster below would put the storage and
 * plant pieces' back-left fallback right on top of it — so their back-left
 * candidate starts here instead, just past the real plant's right edge,
 * rather than at the wall. The workbench piece never reaches down to the
 * plant's row (it stays in the 0.35–1.35 band), so it has no such
 * constraint, but all three share this X so the corner still reads as one
 * arrangement when every piece lands on its second candidate.
 */
const PAPERMOTH_BACK_LEFT_X = 1.0;

/**
 * The third (front) candidate for workbench and storage can't reuse the
 * generic "push toward the front wall at the same X" formula the other
 * decor pieces use: at this room's own X, that band is occupied by
 * Papermoth's own `papermoth-bench` (3,4)-(5,5) and `papermoth-lamp`
 * (5,3.3)-(6,4.3) props. This is the one small gap left in the front third
 * of the room — left of the bench, below the rug — verified clear of every
 * floor prop in Papermoth's actual demo data.
 */
const PAPERMOTH_FRONT_GAP_X = 3.05;
const PAPERMOTH_FRONT_GAP_Y = 2.9;

/** Candidate spots for Papermoth's own print workbench: original back-right corner, then shifted to back-left (clear of the room's own plant prop), then the front gap (clear of the room's own bench and lamp). Unlike its siblings, its front candidate is a fixed verified-clear spot rather than a `gridHeight`-derived one, so it takes only `gridWidth`. */
export function papermothWorkbenchLayouts(gridWidth: number): GridRect[][] {
  const w = 1.7;
  const h = 1.0;
  const backY = 0.35;
  const margin = 0.15;
  return [
    [{ x: gridWidth - w - margin, y: backY, w, h }],
    [{ x: PAPERMOTH_BACK_LEFT_X, y: backY, w, h }],
    [{ x: PAPERMOTH_FRONT_GAP_X, y: PAPERMOTH_FRONT_GAP_Y, w, h }],
  ];
}

/** Candidate spots for Papermoth's flat-file print storage: same priority order as the workbench, resolved independently of it (see `resolvePapermothDecor` for how the two are kept from overlapping each other). Its front candidate shares the same clear gap as the workbench's, offset just enough that the two don't overlap each other if a sibling reservation didn't already rule one out — so, like the workbench, it takes only `gridWidth`. */
export function papermothStorageLayouts(gridWidth: number): GridRect[][] {
  const w = 1.15;
  const h = 0.85;
  const backY = 1.65;
  const margin = 0.65;
  return [
    [{ x: gridWidth - w - margin, y: backY, w, h }],
    [{ x: PAPERMOTH_BACK_LEFT_X + 0.05, y: backY, w, h }],
    [{ x: PAPERMOTH_FRONT_GAP_X + 0.25, y: PAPERMOTH_FRONT_GAP_Y + 0.2, w, h }],
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
    [{ x: PAPERMOTH_BACK_LEFT_X + 1.42, y: backY, w, h }],
    [{ x: gridWidth - w - margin, y: frontY, w, h }],
  ];
}

export interface PapermothDecorResolution {
  workbench: GridRect[] | null;
  storage: GridRect[] | null;
  plant: GridRect[] | null;
}

/**
 * Resolves Papermoth's whole print-studio corner — workbench, storage,
 * accent plant — as one deterministic arrangement rather than three
 * independent lookups. Each piece is resolved in a fixed priority order
 * (workbench, then storage, then plant) against editable room props *and*
 * every rect already accepted for an earlier piece in this same call, so
 * two pieces can never both fall back onto the same spot and overlap each
 * other — the way two independent lookups could, since both pieces'
 * candidate lists push toward the same front-of-room fallback. A piece
 * that finds nothing free (every candidate collides with a prop or an
 * already-placed sibling piece) resolves to null and is simply omitted;
 * it never reserves anything for the pieces after it.
 */
export function resolvePapermothDecor(room: RoomLike): PapermothDecorResolution {
  const reserved: GridRect[] = [];
  const resolve = (layouts: GridRect[][]): GridRect[] | null => {
    const layout = findFreeLayout(room, layouts, reserved);
    if (layout) reserved.push(...layout);
    return layout;
  };
  return {
    workbench: resolve(papermothWorkbenchLayouts(room.gridWidth)),
    storage: resolve(papermothStorageLayouts(room.gridWidth)),
    plant: resolve(papermothPlantLayouts(room.gridWidth, room.gridHeight)),
  };
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
