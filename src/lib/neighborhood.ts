import { iso } from "./iso";
import type { Member } from "./types";
/** Presentation positions do not alter the saved data. */
export function plotFor(position: number) { const n = Math.max(0, Math.min(7, position)); return { u: (n % 4) * 4.7, v: n < 4 ? 0 : 8.2 }; }
export const WORLD_SCALE = 39;
export const WORLD_ORIGIN = { x: 765, y: 155 };
export function plotScreen(position: number) { const { u, v } = plotFor(position); const p = iso(u + 1.4, v + 1.3, 0, WORLD_SCALE); return { x: p.x + WORLD_ORIGIN.x, y: p.y + WORLD_ORIGIN.y }; }

/**
 * A deterministic 0/1 facade subvariant per member, assigned by each
 * member's rank among others sharing its exterior kind (in stable town
 * order) rather than by hashing its id — so two buildings of the same kind
 * are *guaranteed* to differ (0, 1, 0, 1, ...) instead of a coin-flip hash
 * occasionally landing both on the same look. A kind that appears only once
 * still gets a variant (0), which is harmless since there's nothing of the
 * same kind to compare it against. See NeighborhoodArt for how kind + variant
 * become an actual facade/roof/sign/detail difference.
 */
export function facadeVariants(members: Member[]): Record<string, number> {
  const seenPerKind: Record<string, number> = {};
  const result: Record<string, number> = {};
  for (const member of members) {
    const kind = member.building.exterior;
    const rank = seenPerKind[kind] ?? 0;
    result[member.id] = rank % 2;
    seenPerKind[kind] = rank + 1;
  }
  return result;
}
