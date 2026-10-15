"use client";
import { useEffect, useRef, useState } from "react";
import type { Member } from "@/lib/types";
import { plotScreen, WORLD_ORIGIN } from "@/lib/neighborhood";
import { NeighborhoodBuilding, NeighborhoodGround } from "./NeighborhoodArt";
import styles from "./Neighborhood.module.css";
export function Neighborhood({ members, allMembers, selectedId, onSelect, onEnter }: {
    members: Member[];
    allMembers: Member[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onEnter: (id: string) => void;
}) {
    const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
    const [mobile, setMobile] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const drag = useRef<{
        x: number;
        y: number;
        cx: number;
        cy: number;
        moved: boolean;
    } | null>(null);
    const suppressClick = useRef(false);
    useEffect(() => { const mq = window.matchMedia("(max-width:760px)"); const update = () => setMobile(mq.matches); update(); mq.addEventListener("change", update); return () => mq.removeEventListener("change", update); }, []);
    const results = members.map(m => m.id).join(",");
    useEffect(() => {
        if (members.length === 1 && members[0]) {
            const p = plotScreen(members[0].building.position);
            setCamera({ zoom: 1.35, x: 900 - p.x * 1.35, y: 450 - p.y * 1.35 });
        }
        else
            setCamera({ x: 0, y: 0, zoom: 1 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [results]);
    function pan(dx: number, dy: number) { setCamera(c => ({ ...c, x: Math.max(-1100, Math.min(1100, c.x + dx)), y: Math.max(-700, Math.min(700, c.y + dy)) })); }
    function zoom(amount: number) { setCamera(c => { const z = Math.max(.65, Math.min(1.8, c.zoom + amount)); const center = { x: 900, y: 420 }; const ratio = z / c.zoom; return { zoom: z, x: center.x - (center.x - c.x) * ratio, y: center.y - (center.y - c.y) * ratio }; }); }
    return <div className={styles.world}><svg ref={svgRef} className={styles.svg} viewBox={mobile ? "260 20 1080 900" : "0 0 1440 900"} tabIndex={0} role="group" aria-label="Sample neighborhood. Arrow keys pan; plus and minus zoom. Tab selects buildings; Enter opens them." onKeyDown={e => { if (e.target !== e.currentTarget)
        return; const actions: Record<string, () => void> = { ArrowLeft: () => pan(45, 0), ArrowRight: () => pan(-45, 0), ArrowUp: () => pan(0, 45), ArrowDown: () => pan(0, -45), "+": () => zoom(.15), "=": () => zoom(.15), "-": () => zoom(-.15) }; if (actions[e.key]) {
        e.preventDefault();
        actions[e.key]?.();
    } }} onPointerDown={e => { if (e.button !== 0)
        return; suppressClick.current = false; drag.current = { x: e.clientX, y: e.clientY, cx: camera.x, cy: camera.y, moved: false }; }} onPointerMove={e => { const d = drag.current; if (!d)
        return; const dx = e.clientX - d.x, dy = e.clientY - d.y; if (Math.abs(dx) + Math.abs(dy) < 7 && !d.moved)
        return; d.moved = true; suppressClick.current = true; e.currentTarget.setPointerCapture(e.pointerId); const m = svgRef.current?.getScreenCTM(); if (!m)
        return; setCamera(c => ({ ...c, x: Math.max(-1100, Math.min(1100, d.cx + dx / m.a)), y: Math.max(-700, Math.min(700, d.cy + dy / m.d)) })); }} onPointerUp={e => { drag.current = null; if (e.currentTarget.hasPointerCapture(e.pointerId))
        e.currentTarget.releasePointerCapture(e.pointerId); }} onPointerCancel={() => { drag.current = null; }} onClickCapture={e => { if (suppressClick.current) {
        e.stopPropagation();
        suppressClick.current = false;
    } }}>
 <defs><pattern id="world-dot-grid" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#bfd0bc" opacity=".48"/></pattern></defs><rect x="-2000" y="-2000" width="5000" height="5000" fill="url(#world-dot-grid)"/>
 <g transform={`translate(${camera.x} ${camera.y}) scale(${camera.zoom})`}><g transform={`translate(${WORLD_ORIGIN.x} ${WORLD_ORIGIN.y})`}><NeighborhoodGround />{[...allMembers].sort((a, b) => plotScreen(a.building.position).y - plotScreen(b.building.position).y).map(member => { const visible = members.some(m => m.id === member.id); return <g key={member.id} opacity={visible ? 1 : .18} pointerEvents={visible ? "auto" : "none"} aria-hidden={!visible}>{visible ? <NeighborhoodBuilding member={member} selected={member.id === selectedId} onSelect={() => onSelect(member.id)} onEnter={() => onEnter(member.id)}/> : null}</g>; })}</g></g></svg>
 {members.length === 0 ? <p className={styles.empty}>No places match. Try another name or category.</p> : null}
 <div className={styles.controls} role="group" aria-label="Map controls"><button aria-label="Pan left" onClick={() => pan(60, 0)}>←</button><button aria-label="Pan right" onClick={() => pan(-60, 0)}>→</button><button aria-label="Pan up" onClick={() => pan(0, 60)}>↑</button><button aria-label="Pan down" onClick={() => pan(0, -60)}>↓</button><button aria-label="Zoom out" onClick={() => zoom(-.15)}>−</button><button aria-label="Zoom in" onClick={() => zoom(.15)}>+</button><button className={styles.reset} onClick={() => setCamera({ x: 0, y: 0, zoom: 1 })}>Recenter</button></div>
 <div className={styles.legend}><span><i />A sample neighborhood</span><span>Drag to explore · select a building to enter</span></div></div>;
}
