import { iso } from "./iso";
/** Presentation positions do not alter the saved data. */
export function plotFor(position: number) { const n = Math.max(0, Math.min(7, position)); return { u: (n % 4) * 4.7, v: n < 4 ? 0 : 8.2 }; }
export const WORLD_SCALE = 39;
export const WORLD_ORIGIN = { x: 765, y: 155 };
export function plotScreen(position: number) { const { u, v } = plotFor(position); const p = iso(u + 1.4, v + 1.3, 0, WORLD_SCALE); return { x: p.x + WORLD_ORIGIN.x, y: p.y + WORLD_ORIGIN.y }; }
