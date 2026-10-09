/**
 * One true-isometric projection shared by the street and every interior, so
 * the whole product reads as the same world. Ground axes sit at 30°: a unit
 * step along u or v moves (cos30, sin30) in screen space, scaled to taste.
 */

const COS_30 = Math.cos(Math.PI / 6);
const SIN_30 = Math.sin(Math.PI / 6);

export interface IsoPoint {
  x: number;
  y: number;
}

/** Projects a (u, v, z) world point to a 2D screen point. z is height, screen-up positive. */
export function iso(u: number, v: number, z: number, scale: number): IsoPoint {
  return {
    x: (u - v) * COS_30 * scale,
    y: (u + v) * SIN_30 * scale - z * scale,
  };
}

/** Depth for back-to-front painter's-algorithm sorting. Larger draws later (closer). */
export function isoDepth(u: number, v: number, z: number): number {
  return u + v - z * 0.001;
}

/**
 * Builds an SVG matrix transform that maps the unit square (0,0)-(1,0)-(0,1)
 * onto one isometric face, given that face's three corresponding screen
 * corners. Flat facade/sign artwork is authored in the unit square and
 * wrapped in a `<g transform={faceMatrix(...)}>` — this is the only place a
 * flat drawing is mapped onto iso space.
 */
export function faceMatrix(origin: IsoPoint, alongX: IsoPoint, alongY: IsoPoint): string {
  const a = alongX.x - origin.x;
  const b = alongX.y - origin.y;
  const c = alongY.x - origin.x;
  const d = alongY.y - origin.y;
  return `matrix(${a} ${b} ${c} ${d} ${origin.x} ${origin.y})`;
}

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): Rgb {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const int = parseInt(full, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function rgbToHex({ r, g, b }: Rgb): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[r, g, b].map((c) => clamp(c).toString(16).padStart(2, "0")).join("")}`;
}

/** Mixes a hex colour toward white (positive amount) or black (negative), 0..1. */
export function shade(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const target = amount >= 0 ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
  const t = Math.abs(amount);
  return rgbToHex({
    r: r + (target.r - r) * t,
    g: g + (target.g - g) * t,
    b: b + (target.b - b) * t,
  });
}

/** Relative luminance (WCAG) from a hex colour, 0 (black) to 1 (white). */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** Readable ink colour (near-black or near-white) for text drawn on `hex`. */
export function readableInk(hex: string): string {
  return luminance(hex) > 0.45 ? "#1a1410" : "#fbf6ee";
}

/** Faces of one body colour, lit from the same direction everywhere: top lightest, left mid, right darkest. */
export function faceColors(bodyColor: string) {
  return {
    top: shade(bodyColor, 0.28),
    left: shade(bodyColor, -0.08),
    right: shade(bodyColor, -0.22),
  };
}

/** Deterministic 0..1 pseudo-random value from a string seed, stable across renders. */
export function seededRandom(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 10000) / 10000;
}
