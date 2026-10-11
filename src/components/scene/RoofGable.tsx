import { iso, shade } from "@/lib/iso";

interface RoofGableProps {
  /** Footprint this roof sits on — matches the box it caps (same u, v, w, d as that IsoBox). */
  u: number;
  v: number;
  w: number;
  d: number;
  /** Wall-top height the eaves rest on. */
  h: number;
  /** How far the ridge rises above the wall top. */
  rise: number;
  /** How far the front eave overhangs past the wall face at v + d. */
  overhang: number;
  scale: number;
  /** Base roofing colour — shaded into a front slope and a shadowed gable end, independent of the walls below. */
  roofColor: string;
}

function toPoints(pts: { x: number; y: number }[]): string {
  return pts.map((p) => `${p.x},${p.y}`).join(" ");
}

/**
 * A simple gable roof: ridge runs parallel to the facade (along u) at the
 * footprint's midline, sloping down to an overhanging front eave above the
 * entrance and down to the (un-overhung) back eave. Isometric projection
 * looks down on the roof, so unlike IsoBox's vertical walls, *both* slopes
 * are visible here — only the gable end on the far side (u = 0) is hidden by
 * the box itself, so only the near one (u = w) is drawn.
 */
export function RoofGable({ u, v, w, d, h, rise, overhang, scale, roofColor }: RoofGableProps) {
  const at = (du: number, dv: number, dz: number) => iso(u + du, v + dv, dz, scale);
  const ridgeZ = h + rise;
  const vMid = d / 2;
  const vFront = d + overhang;

  const frontSlope = [at(0, vMid, ridgeZ), at(w, vMid, ridgeZ), at(w, vFront, h), at(0, vFront, h)];
  const backSlope = [at(0, vMid, ridgeZ), at(w, vMid, ridgeZ), at(w, 0, h), at(0, 0, h)];
  const gable = [at(w, 0, h), at(w, d, h), at(w, vMid, ridgeZ)];
  const ridgeLine = [at(0, vMid, ridgeZ), at(w, vMid, ridgeZ)];
  const eaveLine = [at(0, vFront, h), at(w, vFront, h)];

  return (
    <g>
      <polygon points={toPoints(backSlope)} fill={shade(roofColor, -0.05)} />
      <polygon points={toPoints(frontSlope)} fill={shade(roofColor, 0.08)} />
      <polygon points={toPoints(gable)} fill={shade(roofColor, -0.22)} />
      <line x1={ridgeLine[0]!.x} y1={ridgeLine[0]!.y} x2={ridgeLine[1]!.x} y2={ridgeLine[1]!.y} stroke={shade(roofColor, 0.3)} strokeWidth={1.5} />
      <line x1={eaveLine[0]!.x} y1={eaveLine[0]!.y} x2={eaveLine[1]!.x} y2={eaveLine[1]!.y} stroke={shade(roofColor, -0.35)} strokeWidth={2} />
    </g>
  );
}
