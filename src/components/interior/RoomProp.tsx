"use client";

import { useState } from "react";
import { faceColors, iso, shade } from "@/lib/iso";
import { IsoBox } from "@/components/scene/IsoBox";
import { PROP_REGISTRY } from "@/lib/prop-registry";
import type { RoomProp as RoomPropModel } from "@/lib/types";

interface RoomPropViewProps {
  prop: RoomPropModel;
  scale: number;
  onOpenContent: (prop: RoomPropModel) => void;
}

function wallQuad(u0: number, u1: number, z0: number, z1: number, scale: number): string {
  const points = [iso(u0, 0, z1, scale), iso(u1, 0, z1, scale), iso(u1, 0, z0, scale), iso(u0, 0, z0, scale)];
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

export function RoomPropView({ prop, scale, onOpenContent }: RoomPropViewProps) {
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
        onClick: handleActivate,
        onKeyDown: (event: React.KeyboardEvent) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleActivate?.();
          }
        },
        style: { cursor: "pointer" },
      }
    : {};

  const focusRing = focused ? (
    <circle
      cx={iso(prop.x + definition.footprint.w / 2, prop.y + definition.footprint.h / 2, 0.02, scale).x}
      cy={iso(prop.x + definition.footprint.w / 2, prop.y + definition.footprint.h / 2, 0.02, scale).y}
      r={10}
      fill="none"
      stroke="var(--color-focus)"
      strokeWidth={2.5}
    />
  ) : null;

  if (definition.mount === "wall") {
    const width = Math.min(definition.footprint.w * 0.78, definition.footprint.w) - 0.1;
    const u0 = prop.x + 0.12;
    const u1 = u0 + width;
    const z0 = 1.0;
    const z1 = prop.kind === "shelf-display" ? 1.55 : 1.85;
    const frameColor = shade(prop.tone, -0.15);

    return (
      <g {...interactionProps}>
        <polygon points={wallQuad(u0, u1, z0, z1, scale)} fill={frameColor} />
        <polygon
          points={wallQuad(u0 + 0.05, u1 - 0.05, z0 + 0.06, z1 - 0.08, scale)}
          fill={shade(prop.tone, prop.kind === "shelf-display" ? -0.3 : 0.35)}
        />
        {focusRing}
      </g>
    );
  }

  // Floor-mounted props: a small box per kind, sized from the registry footprint.
  const margin = 0.12;
  const w = definition.footprint.w - margin * 2;
  const d = definition.footprint.h - margin * 2;
  const u = prop.x + margin;
  const v = prop.y + margin;

  switch (prop.kind) {
    case "rug": {
      const colors = faceColors(prop.tone);
      const points = [iso(u, v, 0.01, scale), iso(u + w, v, 0.01, scale), iso(u + w, v + d, 0.01, scale), iso(u, v + d, 0.01, scale)]
        .map((p) => `${p.x},${p.y}`)
        .join(" ");
      return <polygon points={points} fill={colors.top} opacity={0.9} />;
    }
    case "lamp": {
      const base = iso(u + w / 2, v + d / 2, 0, scale);
      const top = iso(u + w / 2, v + d / 2, 0.85, scale);
      return (
        <g {...interactionProps}>
          <line x1={base.x} y1={base.y} x2={top.x} y2={top.y} stroke={shade(prop.tone, -0.3)} strokeWidth={3} />
          <ellipse cx={top.x} cy={top.y - 6} rx={14} ry={8} fill={prop.tone} />
          {focusRing}
        </g>
      );
    }
    case "plant": {
      const base = iso(u + w / 2, v + d / 2, 0, scale);
      return (
        <g {...interactionProps}>
          <IsoBox u={u + w * 0.2} v={v + d * 0.2} w={w * 0.6} d={d * 0.6} h={0.28} scale={scale} bodyColor="#8a6a52" />
          <ellipse cx={base.x} cy={base.y - 36} rx={20} ry={24} fill={shade(prop.tone, 0.1)} />
          {focusRing}
        </g>
      );
    }
    default: {
      const height = prop.kind === "booking-desk" ? 0.62 : prop.kind === "pedestal" ? 0.75 : prop.kind === "bench" ? 0.32 : 0.5;
      return (
        <g {...interactionProps}>
          <IsoBox u={u} v={v} w={w} d={d} h={height} scale={scale} bodyColor={prop.tone} />
          {focusRing}
        </g>
      );
    }
  }
}
