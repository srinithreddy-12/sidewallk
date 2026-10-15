import { iso, seededRandom, shade } from "@/lib/iso";
import { IsoBox } from "@/components/scene/IsoBox";

/**
 * Fixed, non-interactive set dressing that gives each interior template its
 * own working environment, beyond whatever furniture a member's prop list
 * happens to contain. Nothing here is editable or persisted — it renders
 * purely from `room.template` and `room.gridWidth`, so it applies uniformly
 * to every member of a template and keeps working if a member's props move.
 * Placements were checked against every current member's demo prop layout
 * for each template and sit in the floor strip that layout always leaves
 * clear (see RoomScene for the template → component wiring).
 */

/** A ceiling-mounted lighting track along the back wall, spots aimed down at the frame line — the exhibition-lighting cue every gallery room carries on its own, independent of which pieces happen to be hung. */
export function GalleryLightTrack({ gridWidth, scale }: { gridWidth: number; scale: number }) {
  const z = 2.02;
  const left = iso(0.3, 0, z, scale);
  const right = iso(gridWidth - 0.3, 0, z, scale);
  const fixtureCount = 4;
  return (
    <g aria-hidden="true">
      <line x1={left.x} y1={left.y} x2={right.x} y2={right.y} stroke="#2d2a26" strokeWidth={3} opacity={0.75} />
      {Array.from({ length: fixtureCount }, (_, i) => {
        const t = (i + 0.5) / fixtureCount;
        const u = 0.3 + (gridWidth - 0.6) * t;
        const fixture = iso(u, 0, z, scale);
        const wash = iso(u, 0.15, z - 0.75, scale);
        return (
          <g key={i}>
            <rect x={fixture.x - 5} y={fixture.y - 2} width={10} height={6} rx={1.5} fill="#2d2a26" />
            <ellipse cx={wash.x} cy={wash.y} rx={26} ry={30} fill="#f6e9c8" opacity={0.16} />
          </g>
        );
      })}
    </g>
  );
}

const WORKBENCH_TONE = "#8a6349";
const PROOF_TONES = ["#c9583f", "#3f8f84", "#d9a441", "#7a5a8c"];

/** A compact print/work corner for a gallery room — a tabletop with a fanned stack of proofs — so every gallery reads as a working studio, not just a hang. Papermoth Press keeps its own richer version of this corner (see PapermothStudioDecor); this generic one covers every other gallery member. */
export function GalleryWorkCorner({ gridWidth, scale }: { gridWidth: number; scale: number }) {
  const u = gridWidth - 1.85;
  const v = 0.35;
  const w = 1.6;
  const d = 0.95;
  const h = 0.62;
  const legInset = 0.1;
  const legHeight = 0.55;
  const legColor = shade(WORKBENCH_TONE, -0.35);
  const top = iso(u + w * 0.3, v + d * 0.5, h, scale);
  const shadowCenter = iso(u + w / 2, v + d / 2, 0.01, scale);
  return (
    <g aria-hidden="true">
      <ellipse cx={shadowCenter.x} cy={shadowCenter.y + 2} rx={55} ry={20} fill="#2d2a26" opacity={0.15} />
      <IsoBox u={u + legInset} v={v + legInset} w={0.08} d={0.08} h={legHeight} scale={scale} bodyColor={legColor} />
      <IsoBox u={u + w - legInset - 0.08} v={v + legInset} w={0.08} d={0.08} h={legHeight} scale={scale} bodyColor={legColor} />
      <IsoBox u={u + legInset} v={v + d - legInset - 0.08} w={0.08} d={0.08} h={legHeight} scale={scale} bodyColor={legColor} />
      <IsoBox u={u + w - legInset - 0.08} v={v + d - legInset - 0.08} w={0.08} d={0.08} h={legHeight} scale={scale} bodyColor={legColor} />
      <IsoBox u={u} v={v} w={w} d={d} h={h - legHeight} z0={legHeight} scale={scale} bodyColor={WORKBENCH_TONE} />
      {Array.from({ length: 3 }, (_, i) => {
        const jitter = seededRandom(`gallery-work-corner:${i}`);
        const x = top.x + (jitter - 0.5) * 8;
        const y = top.y - i * 3.5;
        const tone = PROOF_TONES[i % PROOF_TONES.length]!;
        return (
          <g key={i} transform={`rotate(${(i - 1) * 5} ${x} ${y})`}>
            <rect x={x - 14} y={y - 9} width={28} height={19} rx={1} fill="#f0e6d4" stroke={shade(tone, -0.1)} strokeWidth={1} />
            <rect x={x - 14} y={y + 4} width={28} height={5} fill={tone} opacity={0.85} />
          </g>
        );
      })}
    </g>
  );
}

const PEG_TONE = "#6b5a46";
const TOOL_TONE = "#2d2a26";
const MATERIAL_TONES = ["#c9583f", "#3f8f84", "#d9a441", "#7a5a8c", "#4a6b3f"];

/** A wall pegboard of hanging tool silhouettes above a low materials crate, in the gap the demo studio layout always leaves between its two wall shelves — every studio room's "this is a working shop" cue. */
export function StudioWorkCorner({ scale }: { scale: number }) {
  const pegU0 = 3.05;
  const pegU1 = 3.95;
  const pegZ0 = 1.05;
  const pegZ1 = 1.85;
  const board = [
    iso(pegU0, 0, pegZ1, scale),
    iso(pegU1, 0, pegZ1, scale),
    iso(pegU1, 0, pegZ0, scale),
    iso(pegU0, 0, pegZ0, scale),
  ]
    .map((p) => `${p.x},${p.y}`)
    .join(" ");
  const tools: { z: number; shape: "saw" | "mallet" | "shears" }[] = [
    { z: 1.68, shape: "saw" },
    { z: 1.48, shape: "mallet" },
    { z: 1.28, shape: "shears" },
  ];
  const crateU = 2.3;
  const crateV = 0.35;
  const crateW = 1.1;
  const crateD = 0.8;
  const crateH = 0.3;
  const crateTop = iso(crateU + crateW / 2, crateV + crateD / 2, crateH, scale);
  const crateShadow = iso(crateU + crateW / 2, crateV + crateD / 2, 0.01, scale);
  return (
    <g aria-hidden="true">
      <polygon points={board} fill={shade(PEG_TONE, -0.1)} />
      {tools.map((tool, i) => {
        const p = iso((pegU0 + pegU1) / 2, 0, tool.z, scale);
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y - 10} r={1.6} fill="#1a1612" />
            {tool.shape === "saw" ? (
              <path d={`M${p.x - 11} ${p.y} q11 10 22 0`} stroke={TOOL_TONE} strokeWidth={3} fill="none" strokeLinecap="round" />
            ) : tool.shape === "mallet" ? (
              <g>
                <rect x={p.x - 3} y={p.y - 4} width={6} height={16} rx={2} fill="#8a6349" />
                <rect x={p.x - 9} y={p.y - 10} width={18} height={9} rx={2} fill={TOOL_TONE} />
              </g>
            ) : (
              <path
                d={`M${p.x - 9} ${p.y - 6} L${p.x + 2} ${p.y + 8} M${p.x + 9} ${p.y - 6} L${p.x - 2} ${p.y + 8}`}
                stroke={TOOL_TONE}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            )}
          </g>
        );
      })}
      <ellipse cx={crateShadow.x} cy={crateShadow.y + 2} rx={34} ry={13} fill="#2d2a26" opacity={0.15} />
      <IsoBox u={crateU} v={crateV} w={crateW} d={crateD} h={crateH} scale={scale} bodyColor="#8a6349" />
      <IsoBox u={crateU + 0.08} v={crateV + 0.08} w={crateW - 0.16} d={crateD - 0.16} h={crateH - 0.08} scale={scale} bodyColor={shade("#8a6349", -0.2)} />
      {Array.from({ length: 5 }, (_, i) => {
        const jitter = seededRandom(`studio-crate:${i}`);
        const x = crateTop.x - 24 + i * 12 + jitter * 4;
        const y = crateTop.y - 4 - jitter * 6;
        return <ellipse key={i} cx={x} cy={y} rx={5} ry={7} fill={MATERIAL_TONES[i % MATERIAL_TONES.length]!} />;
      })}
    </g>
  );
}

const COUNTER_TONE = "#6b5440";
// Led with the accent tones (not the product-table/shelf tan) so packaging
// reads as its own colourful stack instead of blending into the furniture.
const PACKAGE_TONES = ["#c9583f", "#3f8f84", "#d9a441", "#7a5a8c"];

/** A service counter in the clear middle strip every shop room's demo layout leaves between its flanking plant and bench — the "someone rings you up here" cue no product table or shelf carries on its own. */
export function ShopCounter({ gridWidth, scale }: { gridWidth: number; scale: number }) {
  const w = 1.7;
  const d = 0.75;
  const h = 0.58;
  const u = gridWidth / 2 - w / 2;
  const v = 1.1;
  const shadowCenter = iso(u + w / 2, v + d / 2, 0.01, scale);
  const topBump = iso(u + w * 0.78, v + d * 0.5, h, scale);
  return (
    <g aria-hidden="true">
      <ellipse cx={shadowCenter.x} cy={shadowCenter.y + 2} rx={52} ry={18} fill="#2d2a26" opacity={0.15} />
      <IsoBox u={u} v={v} w={w} d={d} h={h} scale={scale} bodyColor={COUNTER_TONE} />
      <IsoBox u={u} v={v} w={w} d={d} h={0.04} z0={h} scale={scale} bodyColor={shade(COUNTER_TONE, 0.22)} />
      <rect x={topBump.x - 8} y={topBump.y - 12} width={16} height={11} rx={1.5} fill="#e7e1d2" stroke={shade(COUNTER_TONE, -0.3)} />
      <circle cx={topBump.x - 2} cy={topBump.y - 7} r={1.6} fill="#9c7b52" />
    </g>
  );
}

/** Small stacked packaging beside the counter — the "merchandise ready to go" half of a shop that a product table or shelf doesn't carry on its own. */
export function ShopMerchandise({ gridWidth, scale }: { gridWidth: number; scale: number }) {
  const baseU = gridWidth / 2 - 1.55;
  const baseV = 1.15;
  const boxes = [
    { u: baseU, v: baseV, w: 0.42, d: 0.42, h: 0.3, z0: 0 },
    { u: baseU + 0.05, v: baseV + 0.46, w: 0.34, d: 0.34, h: 0.22, z0: 0 },
  ];
  return (
    <g aria-hidden="true">
      {boxes.map((box, i) => {
        const tone = PACKAGE_TONES[i % PACKAGE_TONES.length]!;
        const ribbonTop = iso(box.u + box.w / 2, box.v + box.d / 2, box.z0 + box.h, scale);
        const ribbonBottom = iso(box.u + box.w / 2, box.v + box.d / 2, box.z0, scale);
        return (
          <g key={i}>
            <IsoBox u={box.u} v={box.v} w={box.w} d={box.d} h={box.h} z0={box.z0} scale={scale} bodyColor={tone} />
            <line x1={ribbonTop.x} y1={ribbonTop.y} x2={ribbonBottom.x} y2={ribbonBottom.y} stroke={shade(tone, 0.35)} strokeWidth={3} opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
}
