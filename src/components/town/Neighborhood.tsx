"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Member } from "@/lib/types";
import { facadeVariants, plotScreen, WORLD_ORIGIN } from "@/lib/neighborhood";
import { NeighborhoodBuilding, NeighborhoodGround } from "./NeighborhoodArt";
import styles from "./Neighborhood.module.css";

interface Camera {
    x: number;
    y: number;
    zoom: number;
}

const HORIZONTAL_PAN_LIMIT = 1100;

function clampHorizontalPan(value: number): number {
    return Math.max(-HORIZONTAL_PAN_LIMIT, Math.min(HORIZONTAL_PAN_LIMIT, value));
}

function cameraForMembers(members: Member[]): Camera {
    if (members.length === 1 && members[0]) {
        const point = plotScreen(members[0].building.position);
        return { zoom: 1.35, x: 900 - point.x * 1.35, y: 450 - point.y * 1.35 };
    }
    return { x: 0, y: 0, zoom: 1 };
}

export function Neighborhood({ members, allMembers, selectedId, onSelect, onEnter, sampleLabels = true }: {
    members: Member[];
    allMembers: Member[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onEnter: (id: string) => void;
    /** Only the local sample town is sample content — a real organizer's published town must never say so. */
    sampleLabels?: boolean;
}) {
    const resultKey = members.map(member => member.id).join(",");
    const automaticCamera = cameraForMembers(members);
    const [cameraState, setCameraState] = useState<{ resultKey: string; camera: Camera }>(() => ({
        resultKey,
        camera: automaticCamera,
    }));
    const camera = cameraState.resultKey === resultKey ? cameraState.camera : automaticCamera;
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
    const variants = useMemo(() => facadeVariants(allMembers), [allMembers]);
    function updateCamera(update: Camera | ((camera: Camera) => Camera)) {
        setCameraState(current => {
            const currentCamera = current.resultKey === resultKey ? current.camera : automaticCamera;
            return {
                resultKey,
                camera: typeof update === "function" ? update(currentCamera) : update,
            };
        });
    }
    function pan(dx: number) { updateCamera(c => ({ ...c, x: clampHorizontalPan(c.x + dx) })); }
    const scrollPosition = Math.round(-clampHorizontalPan(camera.x));
    const mapLabel = `${sampleLabels ? "Sample neighborhood" : "Neighborhood"}. Drag left or right, use the neighborhood scrollbar, or press the left and right arrow keys to explore. Tab selects buildings; Enter opens them.`;
    return <div className={styles.world}><svg ref={svgRef} className={styles.svg} viewBox={mobile ? "260 20 1080 900" : "0 0 1440 900"} tabIndex={0} role="group" aria-label={mapLabel} onKeyDown={e => { if (e.target !== e.currentTarget)
        return; const actions: Record<string, () => void> = { ArrowLeft: () => pan(55), ArrowRight: () => pan(-55) }; if (actions[e.key]) {
        e.preventDefault();
        actions[e.key]?.();
    } }} onPointerDown={e => { if (e.button !== 0)
        return; suppressClick.current = false; drag.current = { x: e.clientX, y: e.clientY, cx: camera.x, cy: camera.y, moved: false }; }} onPointerMove={e => { const d = drag.current; if (!d)
        return; const dx = e.clientX - d.x; if (Math.abs(dx) < 7 && !d.moved)
        return; d.moved = true; suppressClick.current = true; e.currentTarget.setPointerCapture(e.pointerId); const m = svgRef.current?.getScreenCTM(); if (!m)
        return; updateCamera(c => ({ ...c, x: clampHorizontalPan(d.cx + dx / m.a) })); }} onPointerUp={e => { drag.current = null; if (e.currentTarget.hasPointerCapture(e.pointerId))
        e.currentTarget.releasePointerCapture(e.pointerId); }} onPointerCancel={() => { drag.current = null; }} onClickCapture={e => { if (suppressClick.current) {
        e.stopPropagation();
        suppressClick.current = false;
    } }}>
 <defs><pattern id="world-dot-grid" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#bfd0bc" opacity=".48"/></pattern></defs><rect x="-2000" y="-2000" width="5000" height="5000" fill="url(#world-dot-grid)"/>
 <g transform={`translate(${camera.x} ${camera.y}) scale(${camera.zoom})`}><g transform={`translate(${WORLD_ORIGIN.x} ${WORLD_ORIGIN.y})`}><NeighborhoodGround />{[...allMembers].sort((a, b) => plotScreen(a.building.position).y - plotScreen(b.building.position).y).map(member => { const visible = members.some(m => m.id === member.id); return <g key={member.id} opacity={visible ? 1 : .18} pointerEvents={visible ? "auto" : "none"} aria-hidden={!visible}>{visible ? <NeighborhoodBuilding member={member} variant={variants[member.id] ?? 0} selected={member.id === selectedId} onSelect={() => onSelect(member.id)} onEnter={() => onEnter(member.id)} sampleLabels={sampleLabels}/> : null}</g>; })}</g></g></svg>
 {members.length === 0 ? <p className={styles.empty}>No places match. Try another name or category.</p> : null}
 <div className={styles.scrollbar}>
   <label htmlFor="neighborhood-scroll">Move through the neighborhood</label>
   <input
     id="neighborhood-scroll"
     type="range"
     min={-HORIZONTAL_PAN_LIMIT}
     max={HORIZONTAL_PAN_LIMIT}
     step="10"
     value={scrollPosition}
     onChange={event => updateCamera(current => ({ ...current, x: -Number(event.target.value) }))}
   />
   <button type="button" onClick={() => updateCamera({ x: 0, y: 0, zoom: 1 })}>Center</button>
 </div>
 <div className={styles.legend}><span><i />{sampleLabels ? "A sample neighborhood" : "The neighborhood"}</span><span>Drag or use the bar to explore · select a building to enter</span></div></div>;
}
