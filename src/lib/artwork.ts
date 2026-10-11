import { seededRandom } from "./iso";

export interface ArtworkShape {
  kind: "rect" | "circle" | "triangle";
  /** Centre of the shape's bounding box, unit square 0..1, for every kind. */
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  opacity: number;
}

export interface ArtworkSpec {
  background: string;
  shapes: ArtworkShape[];
}

/** A small riso-print spot-colour palette — a handful of inks that stay legible layered over cream stock. */
const INK_PALETTE = ["#c9583f", "#3f8f84", "#d9a441", "#7a5a8c", "#4a6b3f", "#2d2a26"];
const PAPER_TONES = ["#f3ead9", "#ece2cd", "#f0e6d4"];

function pick<T>(items: readonly T[], seed: number): T {
  const index = Math.floor(seed * items.length) % items.length;
  return items[index]!;
}

/**
 * Deterministically composes a small abstract riso-print from a seed (the
 * prop id), so each framed piece reads as a distinct original work but is
 * stable across renders — no two pieces in a room look alike, and the same
 * piece never redraws differently on refresh.
 */
export function generateArtwork(seed: string): ArtworkSpec {
  const r = (salt: number) => seededRandom(`${seed}:${salt}`);
  const background = pick(PAPER_TONES, r(1));
  const motif = Math.floor(r(2) * 4);
  const inkA = pick(INK_PALETTE, r(3));
  const inkB = pick(INK_PALETTE, r(4) + 0.17);
  const inkC = pick(INK_PALETTE, r(5) + 0.41);

  const shapes: ArtworkShape[] = [];

  if (motif === 0) {
    // Overlapping sun/moon circles, riso-registration offset.
    shapes.push({ kind: "circle", x: 0.42 + r(6) * 0.1, y: 0.4, w: 0.42, h: 0.42, color: inkA, opacity: 0.85 });
    shapes.push({ kind: "circle", x: 0.58 - r(7) * 0.1, y: 0.46, w: 0.3, h: 0.3, color: inkB, opacity: 0.75 });
    shapes.push({ kind: "rect", x: 0.5, y: 0.78, w: 0.8, h: 0.06, color: inkC, opacity: 0.9 });
  } else if (motif === 1) {
    // Horizon bands, like a dusk landscape.
    shapes.push({ kind: "rect", x: 0.5, y: 0.62, w: 0.84, h: 0.22, color: inkA, opacity: 0.8 });
    shapes.push({ kind: "rect", x: 0.5, y: 0.74, w: 0.84, h: 0.14, color: inkB, opacity: 0.85 });
    shapes.push({ kind: "circle", x: 0.28 + r(8) * 0.4, y: 0.32, w: 0.26, h: 0.26, color: inkC, opacity: 0.8 });
  } else if (motif === 2) {
    // Stacked geometric triangles, a type-foundry mark.
    shapes.push({ kind: "triangle", x: 0.5, y: 0.22, w: 0.5, h: 0.4, color: inkA, opacity: 0.85 });
    shapes.push({ kind: "triangle", x: 0.5 + (r(9) - 0.5) * 0.2, y: 0.5, w: 0.36, h: 0.3, color: inkB, opacity: 0.8 });
    shapes.push({ kind: "rect", x: 0.5, y: 0.74, w: 0.6, h: 0.05, color: inkC, opacity: 0.9 });
  } else {
    // Scattered field notes: a grid of small marks.
    const cols = 3;
    const rows = 3;
    for (let i = 0; i < cols * rows; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const jitter = r(10 + i) * 0.06 - 0.03;
      shapes.push({
        kind: i % 2 === 0 ? "circle" : "rect",
        x: 0.2 + col * 0.3 + jitter,
        y: 0.2 + row * 0.26 + jitter,
        w: 0.14,
        h: 0.14,
        color: i % 3 === 0 ? inkA : i % 3 === 1 ? inkB : inkC,
        opacity: 0.75,
      });
    }
  }

  return { background, shapes };
}
