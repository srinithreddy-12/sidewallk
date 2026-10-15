"use client";
import { useState } from "react";
import { faceColors, faceMatrix, iso, seededRandom, shade } from "@/lib/iso";
import { IsoBox } from "@/components/scene/IsoBox";
import { PROP_REGISTRY } from "@/lib/prop-registry";
import { generateArtwork } from "@/lib/artwork";
import type { RoomProp as RoomPropModel } from "@/lib/types";
import styles from "./RoomProp.module.css";
interface RoomPropViewProps {
    prop: RoomPropModel;
    scale: number;
    onOpenContent: (prop: RoomPropModel) => void;
    /**
     * Gallery-template upgrade (larger statement-piece artwork, a fuller
     * plant) — true for every gallery room, not just one member. See
     * RoomScene's `isGallery`.
     */
    enhanced?: boolean;
}
function wallQuad(u0: number, u1: number, z0: number, z1: number, scale: number): string {
    const points = [iso(u0, 0, z1, scale), iso(u1, 0, z1, scale), iso(u1, 0, z0, scale), iso(u0, 0, z0, scale)];
    return points.map((p) => `${p.x},${p.y}`).join(" ");
}
/** Maps the artwork spec's unit square onto the wall plane between (u0..u1, z0..z1) via a face matrix, so shapes drawn in ordinary coordinates land correctly skewed in iso space. */
function ArtworkFace({ u0, u1, z0, z1, scale, seed }: {
    u0: number;
    u1: number;
    z0: number;
    z1: number;
    scale: number;
    seed: string;
}) {
    const origin = iso(u0, 0, z1, scale);
    const alongX = iso(u1, 0, z1, scale);
    const alongY = iso(u0, 0, z0, scale);
    const matrix = faceMatrix(origin, alongX, alongY);
    const art = generateArtwork(seed);
    // Stable per-prop id (not random) so the clip survives re-renders; sanitized because prop ids are not guaranteed to be valid SVG id characters.
    const clipId = `artwork-clip-${seed.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
    return (<g transform={matrix}>
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={1} height={1}/>
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect x={0} y={0} width={1} height={1} fill={art.background}/>
        {art.shapes.map((shape, i) => {
            if (shape.kind === "circle") {
                return <ellipse key={i} cx={shape.x} cy={shape.y} rx={shape.w / 2} ry={shape.h / 2} fill={shape.color} opacity={shape.opacity}/>;
            }
            if (shape.kind === "triangle") {
                const points = `${shape.x},${shape.y - shape.h / 2} ${shape.x + shape.w / 2},${shape.y + shape.h / 2} ${shape.x - shape.w / 2},${shape.y + shape.h / 2}`;
                return <polygon key={i} points={points} fill={shape.color} opacity={shape.opacity}/>;
            }
            return <rect key={i} x={shape.x - shape.w / 2} y={shape.y - shape.h / 2} width={shape.w} height={shape.h} fill={shape.color} opacity={shape.opacity}/>;
        })}
      </g>
    </g>);
}
/** A small gallery picture light above a frame: a bracket and a soft downward wash. */
function PictureLight({ uMid, z1, scale }: {
    uMid: number;
    z1: number;
    scale: number;
}) {
    const fixture = iso(uMid, 0, z1 + 0.18, scale);
    const wash = iso(uMid, 0, z1 + 0.02, scale);
    return (<g>
      <ellipse cx={wash.x} cy={wash.y} rx={30} ry={14} fill="#f6e9c8" opacity={0.3}/>
      <rect x={fixture.x - 9} y={fixture.y - 3} width={18} height={5} rx={2} fill="#2d2a26"/>
    </g>);
}
export function RoomPropView({ prop, scale, onOpenContent, enhanced = false }: RoomPropViewProps) {
    const [focused, setFocused] = useState(false);
    const definition = PROP_REGISTRY[prop.kind];
    const interactive = definition.isDisplay && Boolean(prop.content);
    const label = prop.content?.title ?? definition.label;
    const handleActivate = interactive
        ? () => onOpenContent(prop)
        : undefined;
    const interactionProps = interactive
        ? {
            role: "button" as const,
            tabIndex: 0,
            "aria-label": `View ${label}`,
            onFocus: () => setFocused(true),
            onBlur: () => setFocused(false),
            onClick: (event: React.MouseEvent<SVGGElement>) => { event.currentTarget.focus(); handleActivate?.(); },
            onKeyDown: (event: React.KeyboardEvent) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleActivate?.();
                }
            },
            style: { cursor: "pointer" },
        }
        : {};
    const focusRing = focused ? (<circle cx={iso(prop.x + definition.footprint.w / 2, prop.y + definition.footprint.h / 2, 0.02, scale).x} cy={iso(prop.x + definition.footprint.w / 2, prop.y + definition.footprint.h / 2, 0.02, scale).y} r={10} fill="none" stroke="var(--color-focus)" strokeWidth={2.5}/>) : null;
    if (definition.mount === "wall") {
        // Every gallery wall gives framed work real scale — a statement piece,
        // not a postage stamp — while studio and shop rooms keep the original,
        // more modest frame.
        const enlargeArtwork = enhanced && prop.kind === "framed-work";
        const width = enlargeArtwork
            ? Math.min(definition.footprint.w * 0.94, definition.footprint.w) - 0.04
            : Math.min(definition.footprint.w * 0.78, definition.footprint.w) - 0.1;
        const u0 = prop.x + (enlargeArtwork ? 0.04 : 0.12);
        const u1 = u0 + width;
        const z0 = enlargeArtwork ? 0.82 : 1.0;
        const z1 = enlargeArtwork ? 1.98 : prop.kind === "shelf-display" ? 1.55 : 1.85;
        const frameColor = shade(prop.tone, -0.15);
        const matInset = enlargeArtwork ? 0.055 : 0.04;
        const zInset = (z1 - z0) * (enlargeArtwork ? 0.06 : 0.08);
        return (<g {...interactionProps} className={interactive ? styles.interactive : undefined}>
        {interactive ? (
            // Invisible padding so a narrow frame still clears the 44px touch target floor.
            <polygon points={wallQuad(u0 - 0.35, u1 + 0.35, z0 - 0.15, z1 + 0.15, scale)} fill="transparent"/>) : null}
        <polygon points={wallQuad(u0, u1, z0, z1, scale)} fill={frameColor}/>
        {prop.kind === "framed-work" ? (<>
            <ArtworkFace u0={u0 + matInset} u1={u1 - matInset} z0={z0 + zInset} z1={z1 - zInset} scale={scale} seed={prop.id}/>
            <PictureLight uMid={(u0 + u1) / 2} z1={z1} scale={scale}/>
          </>) : (<polygon points={wallQuad(u0 + 0.05, u1 - 0.05, z0 + 0.06, z1 - 0.08, scale)} fill={shade(prop.tone, -0.3)}/>)}
        {focusRing}
      </g>);
    }
    // Floor-mounted props: a small, kind-specific shape per the registry footprint.
    const margin = 0.12;
    const w = definition.footprint.w - margin * 2;
    const d = definition.footprint.h - margin * 2;
    const u = prop.x + margin;
    const v = prop.y + margin;
    switch (prop.kind) {
        case "rug": {
            const colors = faceColors(prop.tone);
            const outer = [iso(u, v, 0.01, scale), iso(u + w, v, 0.01, scale), iso(u + w, v + d, 0.01, scale), iso(u, v + d, 0.01, scale)]
                .map((p) => `${p.x},${p.y}`)
                .join(" ");
            const border = 0.16;
            const inner = [
                iso(u + border, v + border, 0.015, scale),
                iso(u + w - border, v + border, 0.015, scale),
                iso(u + w - border, v + d - border, 0.015, scale),
                iso(u + border, v + d - border, 0.015, scale),
            ]
                .map((p) => `${p.x},${p.y}`)
                .join(" ");
            return (<g>
          <polygon points={outer} fill={shade(prop.tone, -0.18)} opacity={0.9}/>
          <polygon points={inner} fill={colors.top} opacity={0.92}/>
        </g>);
        }
        case "lamp": {
            const base = iso(u + w / 2, v + d / 2, 0, scale);
            const shadeBottom = iso(u + w / 2, v + d / 2, 0.72, scale);
            const shadeTop = iso(u + w / 2, v + d / 2, 0.92, scale);
            const poleColor = shade(prop.tone, -0.35);
            return (<g {...interactionProps} className={interactive ? styles.interactive : undefined}>
          <ellipse cx={base.x} cy={base.y + 2} rx={10} ry={4} fill={poleColor}/>
          <line x1={base.x} y1={base.y} x2={shadeBottom.x} y2={shadeBottom.y} stroke={poleColor} strokeWidth={2.5}/>
          <ellipse cx={shadeBottom.x} cy={shadeBottom.y + 10} rx={20} ry={9} fill="#f6e9c8" opacity={0.35}/>
          <polygon points={`${shadeBottom.x - 16},${shadeBottom.y + 4} ${shadeBottom.x + 16},${shadeBottom.y + 4} ${shadeTop.x + 10},${shadeTop.y} ${shadeTop.x - 10},${shadeTop.y}`} fill={prop.tone}/>
          {focusRing}
        </g>);
        }
        case "plant": {
            const jitter = (i: number) => seededRandom(`${prop.id}:${i}`);
            const potTop = iso(u + w / 2, v + d / 2, 0.22, scale);
            const leafTones = ["#4d6b4a", "#5d7a52", "#3e5a3c"];
            // Gallery plants read as a fuller, more cared-for specimen: a
            // two-tone pot and more, varied leaf clusters. Studio and shop
            // rooms keep the original, more modest five-blob plant.
            const leafCount = enhanced ? 9 : 5;
            const leaves = Array.from({ length: leafCount }, (_, i) => {
                const angle = (i / leafCount) * Math.PI * 2 + jitter(i) * 0.6;
                const radius = (enhanced ? 8 : 10) + jitter(i + 5) * (enhanced ? 9 : 6);
                return {
                    cx: potTop.x + Math.cos(angle) * radius,
                    cy: potTop.y - (enhanced ? 17 : 14) - Math.abs(Math.sin(angle)) * (enhanced ? 17 : 14) - jitter(i + 10) * 6,
                    r: (enhanced ? 8 : 9) + jitter(i + 1) * (enhanced ? 7 : 5),
                    tone: leafTones[i % leafTones.length]!,
                };
            });
            return (<g {...interactionProps} className={interactive ? styles.interactive : undefined}>
          <IsoBox u={u + w * 0.22} v={v + d * 0.22} w={w * 0.56} d={d * 0.56} h={0.26} scale={scale} bodyColor="#8a6a52"/>
          {enhanced ? (<IsoBox u={u + w * 0.22} v={v + d * 0.22} w={w * 0.56} d={d * 0.56} h={0.05} z0={0.26} scale={scale} bodyColor={shade("#8a6a52", 0.18)}/>) : null}
          {leaves.map((leaf, i) => (<ellipse key={i} cx={leaf.cx} cy={leaf.cy} rx={leaf.r} ry={leaf.r * 0.8} fill={leaf.tone} opacity={0.92}/>))}
          {focusRing}
        </g>);
        }
        case "bench": {
            const legInset = 0.14;
            const legHeight = 0.16;
            const legColor = shade(prop.tone, -0.4);
            return (<g {...interactionProps} className={interactive ? styles.interactive : undefined}>
          <IsoBox u={u + legInset} v={v + legInset} w={0.1} d={0.1} h={legHeight} scale={scale} bodyColor={legColor}/>
          <IsoBox u={u + w - legInset - 0.1} v={v + legInset} w={0.1} d={0.1} h={legHeight} scale={scale} bodyColor={legColor}/>
          <IsoBox u={u + legInset} v={v + d - legInset - 0.1} w={0.1} d={0.1} h={legHeight} scale={scale} bodyColor={legColor}/>
          <IsoBox u={u + w - legInset - 0.1} v={v + d - legInset - 0.1} w={0.1} d={0.1} h={legHeight} scale={scale} bodyColor={legColor}/>
          <IsoBox u={u} v={v} w={w} d={d} h={0.12} z0={legHeight} scale={scale} bodyColor={prop.tone}/>
          {focusRing}
        </g>);
        }
        case "pedestal": {
            const capHeight = 0.08;
            const columnHeight = 0.62;
            const bookTop = iso(u + w / 2, v + d / 2, columnHeight + capHeight, scale);
            const hasBook = Boolean(prop.content);
            return (<g {...interactionProps} className={interactive ? styles.interactive : undefined}>
          <IsoBox u={u + w * 0.12} v={v + d * 0.12} w={w * 0.76} d={d * 0.76} h={columnHeight} scale={scale} bodyColor={prop.tone}/>
          <IsoBox u={u} v={v} w={w} d={d} h={capHeight} z0={columnHeight} scale={scale} bodyColor={shade(prop.tone, 0.12)}/>
          {hasBook ? (<g transform={`translate(${bookTop.x}, ${bookTop.y - 6})`}>
              <polygon points="-13,2 0,-4 13,2 0,8" fill="#e8dcc6" stroke="#2d2a26" strokeWidth={0.75}/>
              <line x1={-13} y1={2} x2={0} y2={8} stroke="#2d2a26" strokeWidth={0.5} opacity={0.4}/>
            </g>) : null}
          {focusRing}
        </g>);
        }
        default: {
            const height = prop.kind === "booking-desk" ? 0.62 : prop.kind === "product-table" ? 0.5 : 0.5;
            return (<g {...interactionProps} className={interactive ? styles.interactive : undefined}>
          <IsoBox u={u} v={v} w={w} d={d} h={height} scale={scale} bodyColor={prop.tone}/>
          {focusRing}
        </g>);
        }
    }
}
