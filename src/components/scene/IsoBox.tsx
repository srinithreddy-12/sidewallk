import { faceColors, iso, type IsoPoint } from "@/lib/iso";

interface IsoBoxProps {
  u: number;
  v: number;
  w: number;
  d: number;
  h: number;
  scale: number;
  bodyColor: string;
  /** Height the box's bottom face sits at, for stacking one box on another (e.g. a seat raised above its legs). */
  z0?: number;
}

function toPoints(pts: IsoPoint[]): string {
  return pts.map((p) => `${p.x},${p.y}`).join(" ");
}

/**
 * A single box drawn as three faces (top, front-left, front-right), all
 * derived from one body colour so every box in the scene is lit from the
 * same direction. The front corner nearest the viewer is (u+w, v+d, 0); the
 * two visible walls are the ones that meet there — at u+w (varying v) and at
 * v+d (varying u) — never the back faces at u or v. The front-left face
 * (v = d) is where facade detail gets mapped on top of this.
 */
export function IsoBox({ u, v, w, d, h, scale, bodyColor, z0 = 0 }: IsoBoxProps) {
  const colors = faceColors(bodyColor);
  const at = (du: number, dv: number, dz: number) => iso(u + du, v + dv, z0 + dz, scale);

  const top = [at(0, 0, h), at(w, 0, h), at(w, d, h), at(0, d, h)];
  const left = [at(0, d, 0), at(w, d, 0), at(w, d, h), at(0, d, h)];
  const right = [at(w, 0, 0), at(w, d, 0), at(w, d, h), at(w, 0, h)];

  return (
    <g>
      <polygon points={toPoints(left)} fill={colors.left} />
      <polygon points={toPoints(right)} fill={colors.right} />
      <polygon points={toPoints(top)} fill={colors.top} />
    </g>
  );
}
