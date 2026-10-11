import { iso, seededRandom, shade } from "@/lib/iso";
import { IsoBox } from "@/components/scene/IsoBox";
import { BUILDING_DEPTH, BUILDING_SPACING, BUILDING_WIDTH } from "./Building";

const SIDEWALK_DEPTH = 1.3;
const ROAD_DEPTH = 1.1;
const SIDEWALK_TONE = "#d9cdb4";
const ROAD_TONE = "#6b6258";
const MARGIN = 1.4;

interface StreetGroundProps {
  /** Number of building slots the paved area should span, so it covers the whole town even when a search has hidden some buildings. */
  slotCount: number;
  scale: number;
}

function quad(points: { x: number; y: number }[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

/** A street lamp: post, crossbar and a warm glow, matching the lamp used inside rooms. */
function LampPost({ u, v, scale }: { u: number; v: number; scale: number }) {
  const base = iso(u, v, 0, scale);
  const top = iso(u, v, 1.1, scale);
  return (
    <g>
      <ellipse cx={base.x} cy={base.y + 2} rx={8} ry={3} fill="#2d2a26" opacity={0.3} />
      <line x1={base.x} y1={base.y} x2={top.x} y2={top.y} stroke="#3a332c" strokeWidth={3} />
      <ellipse cx={top.x} cy={top.y - 6} rx={16} ry={14} fill="#f6e9c8" opacity={0.3} />
      <circle cx={top.x} cy={top.y - 6} r={6} fill="#e8c36a" />
    </g>
  );
}

/** A small street tree: trunk plus a cluster of canopy blobs, seeded so the shape is stable per slot. */
function StreetTree({ u, v, scale, seed }: { u: number; v: number; scale: number; seed: number }) {
  const trunkTop = iso(u, v, 0.32, scale);
  const canopyTones = ["#5d7a52", "#4d6b4a", "#6a8a5e"];
  const blobs = Array.from({ length: 4 }, (_, i) => {
    const jitter = seededRandom(`tree:${seed}:${i}`);
    const angle = (i / 4) * Math.PI * 2 + jitter;
    return {
      cx: trunkTop.x + Math.cos(angle) * (10 + jitter * 6),
      cy: trunkTop.y - 16 + Math.sin(angle) * (8 + jitter * 4),
      r: 13 + jitter * 7,
      tone: canopyTones[i % canopyTones.length]!,
    };
  });
  return (
    <g>
      <IsoBox u={u - 0.05} v={v - 0.05} w={0.1} d={0.1} h={0.32} scale={scale} bodyColor="#6b5440" />
      {blobs.map((b, i) => (
        <ellipse key={i} cx={b.cx} cy={b.cy} rx={b.r} ry={b.r * 0.85} fill={b.tone} opacity={0.92} />
      ))}
    </g>
  );
}

/**
 * The paved ground the street sits on: a sidewalk in front of the shopfronts
 * with scored expansion joints, a kerb line, a road suggestion beyond it, and
 * a lamp post or tree alternating in each gap between buildings. Spans
 * `slotCount` building slots regardless of which buildings a search has
 * hidden, so the ground never looks like it stops mid-block.
 */
export function StreetGround({ slotCount, scale }: StreetGroundProps) {
  const spanU = Math.max(slotCount, 1) * BUILDING_SPACING;
  const u0 = -MARGIN;
  const u1 = spanU + MARGIN - (BUILDING_SPACING - BUILDING_WIDTH);
  const sidewalkFront = BUILDING_DEPTH;
  const sidewalkBack = sidewalkFront + SIDEWALK_DEPTH;
  const roadBack = sidewalkBack + ROAD_DEPTH;

  const sidewalk = quad([
    iso(u0, sidewalkFront, 0, scale),
    iso(u1, sidewalkFront, 0, scale),
    iso(u1, sidewalkBack, 0, scale),
    iso(u0, sidewalkBack, 0, scale),
  ]);
  const road = quad([
    iso(u0, sidewalkBack, 0, scale),
    iso(u1, sidewalkBack, 0, scale),
    iso(u1, roadBack, 0, scale),
    iso(u0, roadBack, 0, scale),
  ]);
  const kerb = [iso(u0, sidewalkBack, 0, scale), iso(u1, sidewalkBack, 0, scale)];

  const joints = [];
  for (let jointU = Math.ceil(u0); jointU <= u1; jointU += 1) {
    const a = iso(jointU, sidewalkFront, 0, scale);
    const b = iso(jointU, sidewalkBack, 0, scale);
    joints.push(
      <line key={jointU} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={shade(SIDEWALK_TONE, -0.1)} strokeWidth={1} opacity={0.6} />,
    );
  }

  const scenery = [];
  for (let slot = 0; slot < slotCount - 1; slot++) {
    const gapU = slot * BUILDING_SPACING + BUILDING_WIDTH + (BUILDING_SPACING - BUILDING_WIDTH) / 2;
    const gapV = sidewalkFront + 0.55;
    const useTree = seededRandom(`scenery:${slot}`) > 0.5;
    scenery.push(
      useTree ? (
        <StreetTree key={slot} u={gapU} v={gapV} scale={scale} seed={slot} />
      ) : (
        <LampPost key={slot} u={gapU} v={gapV} scale={scale} />
      ),
    );
  }

  return (
    <g>
      <polygon points={road} fill={ROAD_TONE} />
      <polygon points={sidewalk} fill={SIDEWALK_TONE} />
      {joints}
      <line x1={kerb[0]!.x} y1={kerb[0]!.y} x2={kerb[1]!.x} y2={kerb[1]!.y} stroke={shade(SIDEWALK_TONE, -0.3)} strokeWidth={2.5} />
      {scenery}
    </g>
  );
}
