import { faceMatrix, iso, readableInk, seededRandom, shade } from "@/lib/iso";
import { plotFor, WORLD_SCALE as S } from "@/lib/neighborhood";
import { IsoBox } from "@/components/scene/IsoBox";
import { RoofGable } from "@/components/scene/RoofGable";
import { ExteriorFacade } from "./ExteriorFacade";
import type { ExteriorKind, Member } from "@/lib/types";
import styles from "./Neighborhood.module.css";

const points = (coords: number[][]) =>
  coords.map(([u = 0, v = 0, z = 0]) => { const p = iso(u, v, z, S); return `${p.x},${p.y}`; }).join(" ");

export function WorldTree({ u, v, size = 1 }: { u: number; v: number; size?: number }) {
  const p = iso(u, v, 0, S);
  return <g transform={`translate(${p.x} ${p.y}) scale(${size})`} aria-hidden="true"><ellipse cx={13} cy={5} rx={31} ry={12} fill="#315343" opacity=".12"/><path d="M0 1v-58m0 31-14-13m14 5 14-20" stroke="#786044" strokeWidth="5" strokeLinecap="round"/><path d="M-2-85c-18-12-35 5-32 24-12 23 11 36 27 30 23 10 46-2 39-22 10-24-14-40-34-32" fill="#547c5b"/><ellipse cx={-13} cy={-67} rx={19} ry={23} fill="#71956a"/><ellipse cx={9} cy={-72} rx={16} ry={20} fill="#86a777"/><ellipse cx={17} cy={-46} rx={18} ry={17} fill="#64895f"/></g>;
}

function StreetLight({ u, v }: { u: number; v: number }) {
  const p = iso(u, v, 0, S);
  return <g transform={`translate(${p.x} ${p.y})`}><ellipse cx={6} cy={3} rx={12} ry={5} fill="#254c3d" opacity=".14"/><path d="M0 0v-66q0-9 10-9h8" fill="none" stroke="#37594b" strokeWidth="3"/><path d="M11-75h15l-3 9H14Z" fill="#f5ca80" stroke="#37594b" strokeWidth="2"/></g>;
}

export function NeighborhoodGround() {
  return <g aria-hidden="true">
    <polygon points={points([[-2, -1.3, -.28], [19.4, -1.3, -.28], [19.4, 12, -.28], [-2, 12, -.28]])} fill="#a4bba3" transform="translate(13 10)" opacity=".32"/>
    <IsoBox u={-2} v={-1.3} w={21.4} d={13.3} h={.2} z0={-.2} scale={S} bodyColor="#b9cba9"/>
    <polygon points={points([[-1, 3.1, 0], [18, 3.1, 0], [18, 7.3, 0], [-1, 7.3, 0]])} fill="#dfdfcc"/>
    {[3.2, 12.6].map(u => <polygon key={u} points={points([[u, -1, 0], [u + .9, -1, 0], [u + .9, 12, 0], [u, 12, 0]])} fill="#dfdfcc"/>)}
    <polygon points={points([[-1, 4.15, .01], [18, 4.15, .01], [18, 6.2, .01], [-1, 6.2, .01]])} fill="#becbbf"/>
    {Array.from({ length: 18 }, (_, i) => <line key={i} x1={iso(i, 3.1, 0, S).x} y1={iso(i, 3.1, 0, S).y} x2={iso(i, 4.15, 0, S).x} y2={iso(i, 4.15, 0, S).y} stroke="#c5cbbb" strokeWidth=".8"/>)}
    {Array.from({ length: 8 }, (_, i) => <polygon key={i} points={points([[6.2 + i * .3, 4.15, .02], [6.36 + i * .3, 4.15, .02], [6.36 + i * .3, 6.2, .02], [6.2 + i * .3, 6.2, .02]])} fill="#f3eee0"/>)}
    <polygon points={points([[6.8, 6.7, .02], [10.4, 6.7, .02], [10.4, 9, .02], [6.8, 9, .02]])} fill="#e8dfcb"/>
    <IsoBox u={7.6} v={7.3} w={1.7} d={1.15} h={.18} scale={S} bodyColor="#e2d3b8"/>
    <polygon points={points([[7.76, 7.46, .19], [9.14, 7.46, .19], [9.14, 8.29, .19], [7.76, 8.29, .19]])} fill="#84b6ac"/>
    <IsoBox u={8.25} v={7.72} w={.3} d={.3} h={.52} z0={.18} scale={S} bodyColor="#e5d6bb"/>
    {[[-1, .5], [-.6, 9.8], [3.6, 10.9], [18.5, 3], [18.4, 9], [11.8, 7.5], [7, 11.2]].map(([u = 0, v = 0], i) => <WorldTree key={i} u={u} v={v} size={i % 2 ? .8 : 1}/>)}
    {[2.8, 7.5, 12.1, 17].map((u, i) => <StreetLight key={i} u={u} v={3.4}/>)}
    <g transform={faceMatrix(iso(11.2, 4.4, .02, S), iso(15.2, 4.4, .02, S), iso(11.2, 5.7, .02, S))}><text x=".5" y=".58" textAnchor="middle" fontSize=".12" fontWeight="700" letterSpacing=".035" fill="#788e7d">SIDEWALLK LANE</text></g>
    {Array.from({ length: 30 }, (_, i) => { const p = iso((i * 7.13) % 20 - 1, (i * 3.31) % 12, 0, S); return <path key={i} d={`M${p.x - 4} ${p.y}l3-4m-1 4 3-3`} stroke="#8ba477" strokeWidth="1.2" opacity=".6"/>; })}
  </g>;
}

/** Wall-top height range per exterior kind — kind-informed, not arbitrary, with a per-building jitter from a stable seed so two buildings of the same kind still read as individuals. */
const HEIGHT_RANGE: Record<ExteriorKind, [number, number]> = {
  "press-front": [2.4, 2.65],
  "gallery-front": [2.5, 2.7],
  "studio-front": [1.95, 2.15],
  "shop-front": [2.0, 2.2],
  "cafe-front": [2.1, 2.3],
};

/** A low planter box with a hand-placed-looking cluster of blooms — the shopfront street detail for press- and shop-fronts. */
function FlowerBox({ u, v, width, scale, seed }: { u: number; v: number; width: number; scale: number; seed: number }) {
  const bloomTones = ["#c97b5f", "#d9a441", "#a65a6e", "#8a9a5b"];
  const count = 4;
  const blooms = Array.from({ length: count }, (_, i) => {
    const t = (i + 0.5) / count;
    const jitter = seededRandom(`flower:${seed}:${i}`) * 0.1 - 0.05;
    const top = iso(u + width * t + jitter, v - 0.06, 0.26, scale);
    return { top, tone: bloomTones[(i + Math.floor(seed * 10)) % bloomTones.length]! };
  });
  return <g aria-hidden="true">
    <IsoBox u={u} v={v - 0.12} w={width} d={0.14} h={0.15} scale={scale} bodyColor="#6b5440"/>
    {blooms.map((b, i) => <ellipse key={i} cx={b.top.x} cy={b.top.y} rx={7} ry={6} fill={b.tone}/>)}
  </g>;
}

/** A pair of bistro chairs and a round table — the cafe-front street detail. */
function BistroSet({ u, v, scale }: { u: number; v: number; scale: number }) {
  const base = iso(u, v, 0, scale);
  const table = iso(u, v, 0.3, scale);
  const chairs = [iso(u - 0.3, v + 0.2, 0, scale), iso(u + 0.3, v + 0.2, 0, scale)];
  return <g aria-hidden="true">
    <ellipse cx={base.x} cy={base.y + 2} rx={18} ry={7} fill="#2d2a26" opacity={.14}/>
    <line x1={base.x} y1={base.y} x2={table.x} y2={table.y} stroke="#4a4038" strokeWidth={3}/>
    <ellipse cx={table.x} cy={table.y} rx={18} ry={9} fill="#e8dfcb" stroke="#4a4038" strokeWidth={1.5}/>
    {chairs.map((c, i) => <g key={i}><line x1={c.x} y1={c.y} x2={c.x} y2={c.y - 17} stroke="#4a4038" strokeWidth={2}/><ellipse cx={c.x} cy={c.y - 17} rx={7} ry={5} fill="#7a5a44"/></g>)}
  </g>;
}

/** A sandwich-board sign propped by the door — the studio-front street detail. */
function SidewalkEasel({ u, v, scale }: { u: number; v: number; scale: number }) {
  const base = iso(u, v, 0, scale);
  const top = iso(u, v, 0.56, scale);
  return <g aria-hidden="true">
    <ellipse cx={base.x} cy={base.y + 2} rx={11} ry={5} fill="#2d2a26" opacity={.14}/>
    <polygon points={`${base.x - 13},${base.y} ${base.x + 13},${base.y} ${top.x + 4},${top.y} ${top.x - 4},${top.y}`} fill="#6b5a46"/>
    <rect x={top.x - 11} y={top.y + 3} width={22} height={27} rx={2} fill="#2d2a26"/>
    <path d={`M${top.x - 7} ${top.y + 11}h14M${top.x - 7} ${top.y + 18}h10`} stroke="#e8dfcb" strokeWidth={1.4} opacity={.75}/>
  </g>;
}

/** A small freestanding placard on a stake — the gallery-front street detail, standing in for a show notice. */
function PlacardPost({ u, v, scale }: { u: number; v: number; scale: number }) {
  const base = iso(u, v, 0, scale);
  const top = iso(u, v, 0.5, scale);
  return <g aria-hidden="true">
    <ellipse cx={base.x} cy={base.y + 2} rx={6} ry={3} fill="#2d2a26" opacity={.14}/>
    <line x1={base.x} y1={base.y} x2={top.x} y2={top.y} stroke="#3a332c" strokeWidth={2.5}/>
    <rect x={top.x - 20} y={top.y - 14} width={40} height={16} rx={2} fill="#fafbf5" stroke="#8a9686"/>
    <circle cx={top.x - 13} cy={top.y - 6} r={2} fill="#2d2a26"/>
    <line x1={top.x - 6} y1={top.y - 9} x2={top.x + 15} y2={top.y - 9} stroke="#2d2a26" strokeWidth={1.3}/>
    <line x1={top.x - 6} y1={top.y - 4} x2={top.x + 15} y2={top.y - 4} stroke="#2d2a26" strokeWidth={1.3} opacity={.6}/>
  </g>;
}

/** The kind-appropriate street-level prop standing just off the entrance. `mirror` flips which side of the entrance it stands on, to match the mirrored facade. */
function StreetDetail({ kind, u, v, w, d, scale, seed, mirror }: { kind: ExteriorKind; u: number; v: number; w: number; d: number; scale: number; seed: number; mirror: boolean }) {
  const frac = (f: number) => (mirror ? 1 - f : f);
  switch (kind) {
    case "press-front":
      return <FlowerBox u={u + w * frac(0.08)} v={v + d} width={w * 0.38} scale={scale} seed={seed}/>;
    case "shop-front":
      // Shop-fronts carry their own layout variant instead of a mirror, so the flower box stays put rather than flipping independently of the facade.
      return <FlowerBox u={u + w * 0.08} v={v + d} width={w * 0.38} scale={scale} seed={seed}/>;
    case "cafe-front":
      return <BistroSet u={u + w * frac(0.74)} v={v + d + .2} scale={scale}/>;
    case "studio-front":
      return <SidewalkEasel u={u + w * frac(0.1)} v={v + d + .14} scale={scale}/>;
    case "gallery-front":
      return <PlacardPost u={u + w * frac(0.78)} v={v + d + .16} scale={scale}/>;
    default:
      return null;
  }
}

/** A flat canopy with a scalloped striped fringe, authored in the facade's own unit square — the awning carried by cafe- and shop-fronts. */
function StripedAwning({ x0, x1, yTop, yBottom, trim, color }: { x0: number; x1: number; yTop: number; yBottom: number; trim: string; color: string }) {
  const scallop = (yBottom - yTop) * 0.4;
  const stripes = 5;
  const stripeW = (x1 - x0) / stripes;
  const canopy = shade(trim, -0.08);
  return <g aria-hidden="true">
    <path d={`M${x0} ${yTop} H${x1} V${yBottom - scallop} H${x0} Z`} fill={canopy}/>
    {Array.from({ length: stripes }, (_, i) => {
      const sx = x0 + i * stripeW;
      return <path key={i} d={`M${sx} ${yBottom - scallop} h${stripeW} l${-stripeW / 2} ${scallop} Z`} fill={i % 2 ? shade(color, 0.12) : canopy}/>;
    })}
  </g>;
}

/**
 * Roofline and roofing material for a given exterior kind — distinct
 * silhouette and colour per kind, so the skyline reads as a real block, not
 * eight repeats of one box. `jitter` (a per-building seeded 0..1) scales the
 * pitch/overhang by roughly ±15%, so even two buildings of the same kind and
 * the same facade variant still carry a slightly different roofline.
 * `mirror` flips the studio vent box to the other half of the ridge, to
 * match the mirrored facade below it.
 */
function Roofline({ kind, u, v, w, d, h, color, trim, scale, jitter, mirror }: { kind: ExteriorKind; u: number; v: number; w: number; d: number; h: number; color: string; trim: string; scale: number; jitter: number; mirror: boolean }) {
  const f = 0.85 + jitter * 0.3;
  switch (kind) {
    case "press-front":
      return <RoofGable u={u - .08} v={v - .07} w={w + .16} d={d + .14} h={h} rise={.82 * f} overhang={.22 * f} scale={scale} roofColor="#9c4f3d"/>;
    case "cafe-front":
      return <RoofGable u={u - .08} v={v - .07} w={w + .16} d={d + .14} h={h} rise={.55 * f} overhang={.34 * f} scale={scale} roofColor="#3f6b5e"/>;
    case "studio-front": {
      const ventBoxW = .22;
      const ventOffset = mirror ? w * (1 - .58) - ventBoxW : w * .58;
      return <>
        <RoofGable u={u - .06} v={v - .05} w={w + .12} d={d + .1} h={h} rise={.4 * f} overhang={.08 * f} scale={scale} roofColor="#5c5247"/>
        <IsoBox u={u + ventOffset} v={v + d * .36} w={ventBoxW} d={ventBoxW} h={.3} z0={h + .2} scale={scale} bodyColor="#8a8178"/>
      </>;
    }
    case "shop-front":
      return <>
        <IsoBox u={u - .09} v={v - .09} w={w + .18} d={d + .18} h={.15 * f} z0={h} scale={scale} bodyColor={shade(color, -.1)}/>
        <IsoBox u={u + .18} v={v + .18} w={w - .36} d={d - .36} h={.07} z0={h + .15 * f} scale={scale} bodyColor={shade(color, .05)}/>
      </>;
    case "gallery-front":
      return <IsoBox u={u - .05} v={v - .05} w={w + .1} d={d + .1} h={.1 * f} z0={h} scale={scale} bodyColor={shade(trim, -.05)}/>;
    default:
      return null;
  }
}

/** The shop's identifying sign: a flush facade plaque for retail/gallery fronts, a hanging bracket sign for the artisan/cafe fronts. `mirror` moves the bracket sign to the opposite side of the entrance, matching the mirrored facade. */
function SignFixture({ kind, u, v, w, d, h, trim, text, scale, mirror }: { kind: ExteriorKind; u: number; v: number; w: number; d: number; h: number; trim: string; text: string; scale: number; mirror: boolean }) {
  if (kind === "shop-front" || kind === "gallery-front") {
    const p = iso(u + w / 2, v + d, h * 0.86, scale);
    return <g transform={`translate(${p.x} ${p.y})`} aria-hidden="true"><rect x={-54} y={-12} width={108} height={22} rx={4} fill={trim} stroke={shade(trim, -.22)}/><text x={0} y={4} textAnchor="middle" fontSize="11" fontWeight={800} fill={readableInk(trim)}>{text.toUpperCase()}</text></g>;
  }
  const frac = mirror ? 0.14 : 0.86;
  const bracket = iso(u + w * frac, v + d, h, scale);
  const sign = iso(u + w * frac, v + d, h * 0.82, scale);
  const nub = mirror ? 2 : -2;
  return <g aria-hidden="true">
    <line x1={bracket.x} y1={bracket.y} x2={sign.x + nub} y2={sign.y - 9} stroke={shade(trim, -.3)} strokeWidth={2}/>
    <g transform={`translate(${sign.x} ${sign.y})`}><rect x={-46} y={-11} width={92} height={20} rx={3} fill={trim} stroke={shade(trim, -.25)}/><text x={0} y={3} textAnchor="middle" fontSize="10" fontWeight={800} fill={readableInk(trim)}>{text.toUpperCase()}</text></g>
  </g>;
}

export function NeighborhoodBuilding({ member, variant, onEnter, onSelect, selected, sampleLabels = true }: {
  member: Member;
  /** 0 or 1, from `facadeVariants` — guarantees two buildings sharing an exterior kind don't share an architecture. */
  variant: number;
  onEnter: () => void;
  onSelect: () => void;
  selected: boolean;
  /** Only the local sample town is sample content — a real organizer's published building must never say so. */
  sampleLabels?: boolean;
}) {
  const { u, v } = plotFor(member.building.position);
  const kind = member.building.exterior;
  const color = member.building.bodyColor;
  const trim = member.building.trimColor;
  const w = 2.85, d = 2.45;
  const seed = seededRandom(member.id);
  const roofJitter = seededRandom(`${member.id}:roof`);
  const [hMin, hMax] = HEIGHT_RANGE[kind];
  const h = hMin + seed * (hMax - hMin);
  // shop-front gets a genuinely different hand-authored layout per variant
  // (its default is left-right symmetric, so mirroring it would be a no-op)
  // — every other kind mirrors its already-asymmetric default facade.
  const mirror = kind !== "shop-front" && variant === 1;
  const face = faceMatrix(iso(u, v + d, h, S), iso(u + w, v + d, h, S), iso(u, v + d, 0, S));
  const side = faceMatrix(iso(u + w, v + d, h, S), iso(u + w, v, h, S), iso(u + w, v + d, 0, S));
  const label = iso(u + w / 2, v + d + .5, 0, S);
  const descriptor = sampleLabels ? `sample ${member.category} member` : member.category;
  return <g className={`${styles.building} ${selected ? styles.selected : ""}`} role="button" tabIndex={0} aria-label={`Enter ${member.name}, ${descriptor}`} onClick={onEnter} onMouseEnter={onSelect} onFocus={onSelect} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onEnter(); } }}>
    <title>{sampleLabels ? `${member.name} · sample member · click to enter` : `${member.name} · click to enter`}</title>
    <polygon className={styles.plotRing} points={points([[u - .25, v - .25, 0], [u + w + .25, v - .25, 0], [u + w + .25, v + d + .5, 0], [u - .25, v + d + .5, 0]])}/>
    <polygon points={points([[u + .3, v + .2, 0], [u + w + .75, v + .2, 0], [u + w + .75, v + d + .8, 0], [u + .3, v + d + .8, 0]])} fill="#355846" opacity=".15"/>
    <IsoBox u={u} v={v} w={w} d={d} h={h} scale={S} bodyColor={color}/>
    <g transform={side}><rect x="0" y=".92" width="1" height=".08" fill={shade(color, -.2)}/>{[.18, .57].map(x => <g key={x}><rect x={x} y=".18" width=".23" height=".3" fill={shade(color, -.25)}/><rect x={x + .025} y=".2" width=".18" height=".25" fill="#e7eee3"/><path d={`M${x + .115} .2v.25M${x + .025} .32h.18`} stroke={trim} strokeWidth=".017"/></g>)}</g>
    <g transform={face}>
      <g transform={mirror ? "matrix(-1,0,0,1,1,0)" : undefined}>
        <ExteriorFacade kind={kind} bodyColor={color} trimColor={trim} variant={variant}/>
        {kind === "shop-front" ? <StripedAwning x0={.06} x1={.94} yTop={.07} yBottom={.21} trim={trim} color={color}/> : null}
        {kind === "cafe-front" ? <StripedAwning x0={.08} x1={.4} yTop={.1} yBottom={.24} trim={trim} color={color}/> : null}
      </g>
    </g>
    <Roofline kind={kind} u={u} v={v} w={w} d={d} h={h} color={color} trim={trim} scale={S} jitter={roofJitter} mirror={mirror}/>
    <SignFixture kind={kind} u={u} v={v} w={w} d={d} h={h} trim={trim} text={member.building.signText} scale={S} mirror={mirror}/>
    <StreetDetail kind={kind} u={u} v={v} w={w} d={d} scale={S} seed={seed} mirror={mirror}/>
    <g transform={`translate(${label.x} ${label.y + 10})`} className={styles.mapLabel}><rect x="-84" y="-14" width="168" height="30" rx="15" fill="#fafbf5" stroke="#b9cab8"/><text textAnchor="middle" y="5" fontSize="12" fontWeight="650" fill="#2e493d">{member.name}</text></g>
  </g>;
}
