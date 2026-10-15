import { iso, seededRandom, shade } from "@/lib/iso";
import { IsoBox } from "@/components/scene/IsoBox";
import {
  findFreeLayout,
  findFreeWallSpan,
  galleryWorkCornerLayouts,
  shopCounterLayouts,
  studioCrateLayouts,
  studioPegboardSpans,
  type GridRect,
} from "@/lib/template-decor";
import type { Room } from "@/lib/types";

/**
 * Fixed, non-interactive set dressing that gives each interior template its
 * own working environment, beyond whatever furniture a member's prop list
 * happens to contain. Nothing here is editable or persisted, but it is
 * recomputed from the room's *current* props on every render: each piece
 * below asks `lib/template-decor` for a floor rect or wall span that is
 * clear of every prop currently in the room, tries a short list of fallback
 * spots if the default is occupied, and renders nothing at all if every
 * candidate collides. A prop the editor moved or added always wins over a
 * decor piece — decor never draws on top of one (see RoomScene for the
 * template → component wiring, and lib/template-decor.test.ts for the
 * collision-avoidance tests).
 */

type DecorRoom = Pick<Room, "props" | "gridWidth" | "gridHeight">;

/** A ceiling-mounted lighting track along the back wall, spots aimed down at the frame line — the exhibition-lighting cue every gallery room carries on its own, independent of which pieces happen to be hung. Mounted above everything else in the room (z 2.02, under the 2.1 wall height), so it never needs floor-collision checks. */
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

/** A compact print/work corner for a gallery room — a tabletop with a fanned stack of proofs — so every gallery reads as a working studio, not just a hang. Papermoth Press keeps its own richer version of this corner (see PapermothStudioDecor); this generic one covers every other gallery member. Renders nothing if the room's props leave no candidate spot clear. */
export function GalleryWorkCorner({ room, scale }: { room: DecorRoom; scale: number }) {
  const layout = findFreeLayout(room, galleryWorkCornerLayouts(room.gridWidth, room.gridHeight));
  if (!layout) return null;
  const { x: u, y: v, w, h: d } = layout[0]!;
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

/** A wall pegboard of hanging tool silhouettes above a low materials crate — every studio room's "this is a working shop" cue. The pegboard (a wall span) and the crate (a floor rect) are resolved independently, so either can fall back or disappear on its own without taking the other down with it. */
export function StudioWorkCorner({ room, scale }: { room: DecorRoom; scale: number }) {
  const pegSpan = findFreeWallSpan(room, studioPegboardSpans(room.gridWidth));
  const crateLayout = findFreeLayout(room, studioCrateLayouts(room.gridWidth, room.gridHeight));
  if (!pegSpan && !crateLayout) return null;

  const pegZ0 = 1.05;
  const pegZ1 = 1.85;
  const tools: { z: number; shape: "saw" | "mallet" | "shears" }[] = [
    { z: 1.68, shape: "saw" },
    { z: 1.48, shape: "mallet" },
    { z: 1.28, shape: "shears" },
  ];

  let crateU = 0;
  let crateV = 0;
  let crateW = 0;
  let crateD = 0;
  const crateH = 0.3;
  if (crateLayout) {
    ({ x: crateU, y: crateV, w: crateW, h: crateD } = crateLayout[0]!);
  }
  const crateTop = iso(crateU + crateW / 2, crateV + crateD / 2, crateH, scale);
  const crateShadow = iso(crateU + crateW / 2, crateV + crateD / 2, 0.01, scale);

  return (
    <g aria-hidden="true">
      {pegSpan ? (
        <>
          <polygon
            points={[
              iso(pegSpan.u0, 0, pegZ1, scale),
              iso(pegSpan.u1, 0, pegZ1, scale),
              iso(pegSpan.u1, 0, pegZ0, scale),
              iso(pegSpan.u0, 0, pegZ0, scale),
            ]
              .map((p) => `${p.x},${p.y}`)
              .join(" ")}
            fill={shade(PEG_TONE, -0.1)}
          />
          {tools.map((tool, i) => {
            const p = iso((pegSpan.u0 + pegSpan.u1) / 2, 0, tool.z, scale);
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
        </>
      ) : null}
      {crateLayout ? (
        <>
          <ellipse cx={crateShadow.x} cy={crateShadow.y + 2} rx={34} ry={13} fill="#2d2a26" opacity={0.15} />
          <IsoBox u={crateU} v={crateV} w={crateW} d={crateD} h={crateH} scale={scale} bodyColor="#8a6349" />
          <IsoBox u={crateU + 0.08} v={crateV + 0.08} w={crateW - 0.16} d={crateD - 0.16} h={crateH - 0.08} scale={scale} bodyColor={shade("#8a6349", -0.2)} />
          {Array.from({ length: 5 }, (_, i) => {
            const jitter = seededRandom(`studio-crate:${i}`);
            const x = crateTop.x - 24 + i * 12 + jitter * 4;
            const y = crateTop.y - 4 - jitter * 6;
            return <ellipse key={i} cx={x} cy={y} rx={5} ry={7} fill={MATERIAL_TONES[i % MATERIAL_TONES.length]!} />;
          })}
        </>
      ) : null}
    </g>
  );
}

const COUNTER_TONE = "#6b5440";
// Led with the accent tones (not the product-table/shelf tan) so packaging
// reads as its own colourful stack instead of blending into the furniture.
const PACKAGE_TONES = ["#c9583f", "#3f8f84", "#d9a441", "#7a5a8c"];

/** A service counter plus its stacked packaging — the "someone rings you up here" and "merchandise ready to go" cues no product table or shelf carries on its own. The three pieces are resolved as one composite so they always land together, or not at all. */
export function ShopCounterDecor({ room, scale }: { room: DecorRoom; scale: number }) {
  const layout = findFreeLayout(room, shopCounterLayouts(room.gridWidth, room.gridHeight));
  if (!layout) return null;
  const [counter, box1, box2] = layout as [GridRect, GridRect, GridRect];
  const counterH = 0.58;
  const shadowCenter = iso(counter.x + counter.w / 2, counter.y + counter.h / 2, 0.01, scale);
  const topBump = iso(counter.x + counter.w * 0.78, counter.y + counter.h * 0.5, counterH, scale);
  // Packaging box footprints (w × depth) come from the resolved layout; the
  // 3D stack height is a separate, decor-only number, not part of the rect.
  const boxes: { rect: GridRect; height: number }[] = [
    { rect: box1, height: 0.3 },
    { rect: box2, height: 0.22 },
  ];
  return (
    <g aria-hidden="true">
      <ellipse cx={shadowCenter.x} cy={shadowCenter.y + 2} rx={52} ry={18} fill="#2d2a26" opacity={0.15} />
      <IsoBox u={counter.x} v={counter.y} w={counter.w} d={counter.h} h={counterH} scale={scale} bodyColor={COUNTER_TONE} />
      <IsoBox u={counter.x} v={counter.y} w={counter.w} d={counter.h} h={0.04} z0={counterH} scale={scale} bodyColor={shade(COUNTER_TONE, 0.22)} />
      <rect x={topBump.x - 8} y={topBump.y - 12} width={16} height={11} rx={1.5} fill="#e7e1d2" stroke={shade(COUNTER_TONE, -0.3)} />
      <circle cx={topBump.x - 2} cy={topBump.y - 7} r={1.6} fill="#9c7b52" />
      {boxes.map(({ rect, height }, i) => {
        const tone = PACKAGE_TONES[i % PACKAGE_TONES.length]!;
        const ribbonTop = iso(rect.x + rect.w / 2, rect.y + rect.h / 2, height, scale);
        const ribbonBottom = iso(rect.x + rect.w / 2, rect.y + rect.h / 2, 0, scale);
        return (
          <g key={i}>
            <IsoBox u={rect.x} v={rect.y} w={rect.w} d={rect.h} h={height} scale={scale} bodyColor={tone} />
            <line x1={ribbonTop.x} y1={ribbonTop.y} x2={ribbonBottom.x} y2={ribbonBottom.y} stroke={shade(tone, 0.35)} strokeWidth={3} opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
}
