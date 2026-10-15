import { iso, seededRandom, shade } from "@/lib/iso";
import { IsoBox } from "@/components/scene/IsoBox";
import { findFreeLayout, papermothPlantLayouts, papermothStorageLayouts, papermothWorkbenchLayouts } from "@/lib/template-decor";
import type { Room } from "@/lib/types";
interface PapermothStudioDecorProps {
    room: Pick<Room, "props" | "gridWidth" | "gridHeight">;
    scale: number;
}
const WORKBENCH_TONE = "#8a6349";
const STORAGE_TONE = "#5c6b63";
const PRINT_TONES = ["#c9583f", "#3f8f84", "#d9a441", "#7a5a8c"];
/** Soft, consistent-light contact shadow under a fixed decor piece — same recipe RoomScene uses for editable floor props, so the whole room reads as one lighting pass. */
function ContactShadow({ u, v, scale, rx, ry }: {
    u: number;
    v: number;
    scale: number;
    rx: number;
    ry: number;
}) {
    const p = iso(u, v, 0.01, scale);
    return <ellipse cx={p.x} cy={p.y + 2} rx={rx} ry={ry} fill="#2d2a26" opacity={0.16}/>;
}
/**
 * A short stack of loose riso-printed sheets, fanned slightly so each
 * sheet's edge reads as a distinct colour — the "print storage" half of a
 * working print studio, not just a gallery. `sx`/`sy` is an already-projected
 * screen point (an `iso()` result), so this only ever adds small pixel
 * offsets around it rather than projecting again.
 */
function PrintStack({ sx, sy, seed }: {
    sx: number;
    sy: number;
    seed: string;
}) {
    const sheets = Array.from({ length: 4 }, (_, i) => {
        const jitter = seededRandom(`${seed}:${i}`);
        const x = sx + (jitter - 0.5) * 8;
        const y = sy - i * 3.5;
        return { x, y, tone: PRINT_TONES[i % PRINT_TONES.length]! };
    });
    return (<g>
      {sheets.map((sheet, i) => (<g key={i} transform={`rotate(${(i - 1.5) * 4} ${sheet.x} ${sheet.y})`}>
          <rect x={sheet.x - 15} y={sheet.y - 10} width={30} height={21} rx={1} fill="#f0e6d4" stroke={shade(sheet.tone, -0.1)} strokeWidth={1}/>
          <rect x={sheet.x - 15} y={sheet.y + 5} width={30} height={5} fill={sheet.tone} opacity={0.85}/>
        </g>))}
    </g>);
}
/**
 * Two or three hand-bound books stacked at a slight lean, echoing the
 * pedestal's single book but as a working stack. `sx`/`sy` is an
 * already-projected screen point — see `PrintStack`.
 */
function BookStack({ sx, sy }: {
    sx: number;
    sy: number;
}) {
    const covers = ["#6b4a3a", "#2d4a4a", "#9c7b3f"];
    return (<g>
      {covers.map((tone, i) => {
            const y = sy - i * 5.5;
            const x = sx + (i - 1) * 2.5;
            return (<polygon key={i} points={`${x - 16},${y + 2} ${x},${y - 5} ${x + 16},${y + 2} ${x},${y + 9}`} fill={tone} stroke={shade(tone, -0.3)} strokeWidth={0.75}/>);
        })}
    </g>);
}
/** A working print bench: tabletop, a fanned stack of proofs, a brayer and a small ink tin — the "active studio" half of Papermoth's room, set below the third gallery frame. */
function PrintWorkbench({ u, v, scale }: {
    u: number;
    v: number;
    scale: number;
}) {
    const w = 1.7;
    const d = 1.0;
    const h = 0.65;
    const legColor = shade(WORKBENCH_TONE, -0.35);
    const legInset = 0.1;
    const legHeight = 0.58;
    const top = iso(u + w * 0.28, v + d * 0.5, h, scale);
    const inkTin = iso(u + w * 0.78, v + d * 0.62, h, scale);
    const brayerA = iso(u + w * 0.62, v + d * 0.28, h, scale);
    const brayerB = iso(u + w * 0.82, v + d * 0.22, h, scale);
    return (<g>
      <ContactShadow u={u + w / 2} v={v + d / 2} scale={scale} rx={60} ry={22}/>
      <IsoBox u={u + legInset} v={v + legInset} w={0.08} d={0.08} h={legHeight} scale={scale} bodyColor={legColor}/>
      <IsoBox u={u + w - legInset - 0.08} v={v + legInset} w={0.08} d={0.08} h={legHeight} scale={scale} bodyColor={legColor}/>
      <IsoBox u={u + legInset} v={v + d - legInset - 0.08} w={0.08} d={0.08} h={legHeight} scale={scale} bodyColor={legColor}/>
      <IsoBox u={u + w - legInset - 0.08} v={v + d - legInset - 0.08} w={0.08} d={0.08} h={legHeight} scale={scale} bodyColor={legColor}/>
      <IsoBox u={u} v={v} w={w} d={d} h={h - legHeight} z0={legHeight} scale={scale} bodyColor={WORKBENCH_TONE}/>
      <PrintStack sx={top.x} sy={top.y} seed="papermoth-workbench"/>
      {/* Brayer: a small roller, resting diagonally beside the proofs. */}
      <line x1={brayerA.x} y1={brayerA.y} x2={brayerB.x} y2={brayerB.y} stroke="#4a4038" strokeWidth={4} strokeLinecap="round"/>
      <circle cx={brayerA.x} cy={brayerA.y} r={3.5} fill="#2d2a26"/>
      <circle cx={brayerB.x} cy={brayerB.y} r={3.5} fill="#2d2a26"/>
      <rect x={inkTin.x - 7} y={inkTin.y - 10} width={14} height={10} rx={1.5} fill="#c9583f" stroke="#7a3d2c" strokeWidth={1}/>
    </g>);
}
/** A low flat-file storage unit — three stepped drawer bands with printed-sheet edges peeking out — standing in for the member's print inventory, topped with a small book stack. */
function PrintStorage({ u, v, scale }: {
    u: number;
    v: number;
    scale: number;
}) {
    const w = 1.15;
    const d = 0.85;
    const bandHeight = 0.16;
    const bands = [0, 1, 2];
    const topZ = bandHeight * bands.length;
    const topCenter = iso(u + w / 2, v + d / 2, topZ, scale);
    return (<g>
      <ContactShadow u={u + w / 2} v={v + d / 2} scale={scale} rx={42} ry={16}/>
      {bands.map((band) => {
            const z0 = band * bandHeight;
            const tone = shade(STORAGE_TONE, band * 0.06 - 0.06);
            const edgeTone = PRINT_TONES[band % PRINT_TONES.length]!;
            const handle = iso(u + w * 0.5, v + d + 0.005, z0 + bandHeight * 0.5, scale);
            return (<g key={band}>
            <IsoBox u={u} v={v} w={w} d={d} h={bandHeight - 0.015} z0={z0} scale={scale} bodyColor={tone}/>
            {/* A sliver of printed paper visible at the drawer's front edge. */}
            <rect x={handle.x - 16} y={handle.y - 2.5} width={32} height={3} fill={edgeTone} opacity={0.75}/>
          </g>);
        })}
      <BookStack sx={topCenter.x} sy={topCenter.y - 4}/>
    </g>);
}
/** A trailing accent plant tucked beside the storage unit, so the print-studio corner reads as lived-in rather than purely functional. */
function AccentPlant({ u, v, scale }: {
    u: number;
    v: number;
    scale: number;
}) {
    const potTop = iso(u, v, 0.16, scale);
    const leafTones = ["#4d6b4a", "#6a8a5e", "#3e5a3c"];
    const leaves = Array.from({ length: 6 }, (_, i) => {
        const jitter = seededRandom(`papermoth-accent-plant:${i}`);
        const angle = (i / 6) * Math.PI * 2 + jitter * 0.5;
        const radius = 7 + jitter * 7;
        const trail = i % 2 === 0 ? 10 : 0;
        return {
            cx: potTop.x + Math.cos(angle) * radius,
            cy: potTop.y - 8 + trail - Math.abs(Math.sin(angle)) * 10 - jitter * 5,
            r: 6 + jitter * 4,
            tone: leafTones[i % leafTones.length]!,
        };
    });
    return (<g>
      <ContactShadow u={u} v={v} scale={scale} rx={16} ry={7}/>
      <IsoBox u={u - 0.13} v={v - 0.13} w={0.26} d={0.26} h={0.17} scale={scale} bodyColor="#9c7b52"/>
      {leaves.map((leaf, i) => (<ellipse key={i} cx={leaf.cx} cy={leaf.cy} rx={leaf.r} ry={leaf.r * 0.78} fill={leaf.tone} opacity={0.9}/>))}
    </g>);
}
/**
 * Fixed, non-interactive set dressing that turns Papermoth's back-right
 * corner into a working print studio beneath the third gallery frame — a
 * workbench with proofs in progress, a flat-file of stored prints topped
 * with books, and an accent plant. Purely presentational: nothing here is
 * editable or persisted, so it has no effect on the override system or the
 * editor — but each of the three pieces is still recomputed from the room's
 * *current* `props` on every render via the same `findFreeLayout` geometry
 * `TemplateDecor` uses (see `lib/template-decor.ts`), so a prop the editor
 * moved or added onto this corner is never drawn over: the piece falls back
 * to an alternate spot, or renders nothing at all if every candidate
 * collides. The three pieces resolve independently of each other, so losing
 * one (say, the plant) doesn't take the other two down with it.
 */
export function PapermothStudioDecor({ room, scale }: PapermothStudioDecorProps) {
    const workbench = findFreeLayout(room, papermothWorkbenchLayouts(room.gridWidth, room.gridHeight));
    const storage = findFreeLayout(room, papermothStorageLayouts(room.gridWidth, room.gridHeight));
    const plant = findFreeLayout(room, papermothPlantLayouts(room.gridWidth, room.gridHeight));
    if (!workbench && !storage && !plant) return null;
    return (<g aria-hidden="true">
      {workbench ? <PrintWorkbench u={workbench[0]!.x} v={workbench[0]!.y} scale={scale}/> : null}
      {storage ? <PrintStorage u={storage[0]!.x} v={storage[0]!.y} scale={scale}/> : null}
      {plant ? <AccentPlant u={plant[0]!.x + plant[0]!.w / 2} v={plant[0]!.y + plant[0]!.h / 2} scale={scale}/> : null}
    </g>);
}
