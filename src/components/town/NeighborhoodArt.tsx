import { faceMatrix, iso, shade } from "@/lib/iso";
import { plotFor, WORLD_SCALE as S } from "@/lib/neighborhood";
import { IsoBox } from "@/components/scene/IsoBox";
import { RoofGable } from "@/components/scene/RoofGable";
import type { Member } from "@/lib/types";
import styles from "./Neighborhood.module.css";
const points = (coords: number[][]) => coords.map(([u = 0, v = 0, z = 0]) => { const p = iso(u, v, z, S); return `${p.x},${p.y}`; }).join(" ");
export function WorldTree({ u, v, size = 1 }: {
    u: number;
    v: number;
    size?: number;
}) { const p = iso(u, v, 0, S); return <g transform={`translate(${p.x} ${p.y}) scale(${size})`} aria-hidden="true"><ellipse cx={13} cy={5} rx={31} ry={12} fill="#315343" opacity=".12"/><path d="M0 1v-58m0 31-14-13m14 5 14-20" stroke="#786044" strokeWidth="5" strokeLinecap="round"/><path d="M-2-85c-18-12-35 5-32 24-12 23 11 36 27 30 23 10 46-2 39-22 10-24-14-40-34-32" fill="#547c5b"/><ellipse cx={-13} cy={-67} rx={19} ry={23} fill="#71956a"/><ellipse cx={9} cy={-72} rx={16} ry={20} fill="#86a777"/><ellipse cx={17} cy={-46} rx={18} ry={17} fill="#64895f"/></g>; }
function StreetLight({ u, v }: {
    u: number;
    v: number;
}) { const p = iso(u, v, 0, S); return <g transform={`translate(${p.x} ${p.y})`}><ellipse cx={6} cy={3} rx={12} ry={5} fill="#254c3d" opacity=".14"/><path d="M0 0v-66q0-9 10-9h8" fill="none" stroke="#37594b" strokeWidth="3"/><path d="M11-75h15l-3 9H14Z" fill="#f5ca80" stroke="#37594b" strokeWidth="2"/></g>; }
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
export function NeighborhoodBuilding({ member, onEnter, onSelect, selected }: {
    member: Member;
    onEnter: () => void;
    onSelect: () => void;
    selected: boolean;
}) {
    const { u, v } = plotFor(member.building.position);
    const pos = member.building.position;
    const w = 2.85, d = 2.45, h = pos % 3 === 0 ? 2.55 : 2.05;
    const colors = ["#ead8bb", "#bbccc1", "#c3d4d1", "#deb098", "#d7c5a5", "#b9c9b1", "#dcc2b0", "#b8c4ce"];
    const color = colors[pos % 8] ?? member.building.bodyColor;
    const trim = pos % 2 ? "#3e5c4c" : "#7b5546";
    const face = faceMatrix(iso(u, v + d, h, S), iso(u + w, v + d, h, S), iso(u, v + d, 0, S));
    const side = faceMatrix(iso(u + w, v + d, h, S), iso(u + w, v, h, S), iso(u + w, v + d, 0, S));
    const label = iso(u + w / 2, v + d + .5, 0, S);
    return <g className={`${styles.building} ${selected ? styles.selected : ""}`} role="button" tabIndex={0} aria-label={`Enter ${member.name}, sample ${member.category} member`} onClick={onEnter} onMouseEnter={onSelect} onFocus={onSelect} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onEnter();
    } }}>
 <title>{`${member.name} · sample member · click to enter`}</title><polygon className={styles.plotRing} points={points([[u - .25, v - .25, 0], [u + w + .25, v - .25, 0], [u + w + .25, v + d + .5, 0], [u - .25, v + d + .5, 0]])}/>
 <polygon points={points([[u + .3, v + .2, 0], [u + w + .75, v + .2, 0], [u + w + .75, v + d + .8, 0], [u + .3, v + d + .8, 0]])} fill="#355846" opacity=".15"/><IsoBox u={u} v={v} w={w} d={d} h={h} scale={S} bodyColor={color}/>
 <g transform={side}><rect x="0" y=".92" width="1" height=".08" fill={shade(color, -.2)}/>{[.18, .57].map(x => <g key={x}><rect x={x} y=".18" width=".23" height=".3" fill={shade(color, -.25)}/><rect x={x + .025} y=".2" width=".18" height=".25" fill="#e7eee3"/><path d={`M${x + .115} .2v.25M${x + .025} .32h.18`} stroke={trim} strokeWidth=".017"/></g>)}</g>
 <g transform={face}><rect x="0" y=".92" width="1" height=".08" fill={trim} opacity=".5"/><rect x=".045" y=".055" width=".91" height=".025" fill={shade(color, .4)}/><rect x=".06" y=".4" width=".51" height=".42" fill={trim}/><rect x=".085" y=".425" width=".46" height=".37" fill="#c7d6ca"/><path d="M.31 .43v.36M.09 .61h.45" stroke={trim} strokeWidth=".02"/><path d="m.1 .44.13 0-.11 .31H.1Z" fill="#f7f4e6" opacity=".65"/><rect x=".66" y=".37" width=".27" height=".55" fill={trim}/><rect x=".69" y=".4" width=".21" height=".49" fill={shade(trim, .13)}/><rect x=".71" y=".43" width=".17" height=".25" fill="#b7c9bd"/><circle cx=".86" cy=".74" r=".013" fill="#f3d59a"/><rect x=".08" y=".28" width=".84" height=".09" fill="#faf5e8"/><text x=".5" y=".341" textAnchor="middle" fill={trim} fontSize=".043" fontWeight="800" letterSpacing=".004">{member.building.signText.toUpperCase()}</text>{h > 2.3 ? [.14, .58].map(x => <g key={x}><rect x={x} y=".105" width=".25" height=".135" fill={trim}/><rect x={x + .015} y=".118" width=".22" height=".105" fill="#dce5d6"/><path d={`M${x + .125} .12v.1`} stroke={trim} strokeWidth=".015"/></g>) : null}</g>
 {pos % 3 === 0 ? <RoofGable u={u - .08} v={v - .07} w={w + .16} d={d + .14} h={h} rise={.8} overhang={.16} scale={S} roofColor={pos === 0 ? "#af6651" : "#597164"}/> : <><IsoBox u={u - .09} v={v - .09} w={w + .18} d={d + .18} h={.15} z0={h} scale={S} bodyColor={pos % 2 ? "#62796a" : "#9e8270"}/><IsoBox u={u + .18} v={v + .18} w={w - .36} d={d - .36} h={.07} z0={h + .15} scale={S} bodyColor={shade(color, .05)}/></>}
 {pos % 2 === 1 ? <g transform={face}><path d="M.03 .39h.57l.035.12H0Z" fill="#f3e9d4"/>{[0, .12, .24, .36, .48].map(x => <path key={x} d={`M${x + .03} .39h.065l.004 .12h-.07Z`} fill="#9aa97e"/>)}</g> : null}
 <IsoBox u={u + .2} v={v + d + .05} w={1.25} d={.2} h={.25} scale={S} bodyColor="#896d53"/>{[.35, .65, .95, 1.25].map((x, i) => { const p = iso(u + x, v + d + .15, .35, S); return <g key={i}><circle cx={p.x} cy={p.y} r="7" fill="#738b5e"/><circle cx={p.x + 2} cy={p.y - 3} r="3" fill={i % 2 ? "#e8b86d" : "#d68774"}/></g>; })}
 <g transform={`translate(${label.x} ${label.y + 10})`} className={styles.mapLabel}><rect x="-84" y="-14" width="168" height="30" rx="15" fill="#fafbf5" stroke="#b9cab8"/><text textAnchor="middle" y="5" fontSize="12" fontWeight="650" fill="#2e493d">{member.name}</text></g></g>;
}
