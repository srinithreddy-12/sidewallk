"use client";

import { useState } from "react";
import { faceMatrix, iso, readableInk } from "@/lib/iso";
import { IsoBox } from "@/components/scene/IsoBox";
import { ExteriorFacade } from "./ExteriorFacade";
import type { Building as BuildingModel } from "@/lib/types";

export const BUILDING_WIDTH = 2.2;
export const BUILDING_DEPTH = 2;
export const BUILDING_HEIGHT = 1.3;
export const BUILDING_SPACING = 3.3;

interface BuildingProps {
  building: BuildingModel;
  name: string;
  scale: number;
  onActivate: () => void;
  highlighted: boolean;
}

/** Street position (u, v) for a building at a given street slot. */
export function buildingOrigin(position: number): { u: number; v: number } {
  return { u: position * BUILDING_SPACING, v: 0 };
}

export function Building({ building, name, scale, onActivate, highlighted }: BuildingProps) {
  const [focused, setFocused] = useState(false);
  const { u, v } = buildingOrigin(building.position);

  const faceV = v + BUILDING_DEPTH;
  const corner00 = iso(u, faceV, BUILDING_HEIGHT, scale);
  const corner10 = iso(u + BUILDING_WIDTH, faceV, BUILDING_HEIGHT, scale);
  const corner01 = iso(u, faceV, 0, scale);
  const matrix = faceMatrix(corner00, corner10, corner01);

  const labelPoint = iso(u + BUILDING_WIDTH / 2, faceV + 0.55, 0, scale);
  const roofPoint = iso(u + BUILDING_WIDTH / 2, faceV, BUILDING_HEIGHT, scale);

  const showRing = focused || highlighted;
  const ringA = iso(u - 0.15, v - 0.15, 0, scale);
  const ringB = iso(u + BUILDING_WIDTH + 0.15, v - 0.15, 0, scale);
  const ringC = iso(u + BUILDING_WIDTH + 0.15, v + BUILDING_DEPTH + 0.15, 0, scale);
  const ringD = iso(u - 0.15, v + BUILDING_DEPTH + 0.15, 0, scale);

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`Enter ${name}`}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onClick={onActivate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onActivate();
        }
      }}
      style={{ cursor: "pointer" }}
    >
      {showRing ? (
        <polygon
          points={`${ringA.x},${ringA.y} ${ringB.x},${ringB.y} ${ringC.x},${ringC.y} ${ringD.x},${ringD.y}`}
          fill="none"
          stroke="var(--color-focus)"
          strokeWidth={3}
        />
      ) : null}
      <IsoBox u={u} v={v} w={BUILDING_WIDTH} d={BUILDING_DEPTH} h={BUILDING_HEIGHT} scale={scale} bodyColor={building.bodyColor} />
      <g transform={matrix}>
        <ExteriorFacade kind={building.exterior} bodyColor={building.bodyColor} trimColor={building.trimColor} />
      </g>
      <g transform={`translate(${roofPoint.x}, ${roofPoint.y - 6})`}>
        <rect x={-46} y={-16} width={92} height={18} rx={4} fill={building.trimColor} opacity={0.92} />
        <text x={0} y={-3} textAnchor="middle" fontSize={10} fontWeight={700} fill={readableInk(building.trimColor)}>
          {building.signText}
        </text>
      </g>
      <text
        x={labelPoint.x}
        y={labelPoint.y}
        textAnchor="middle"
        fontSize={13}
        fontWeight={600}
        fill="var(--color-ink)"
      >
        {name}
      </text>
    </g>
  );
}
