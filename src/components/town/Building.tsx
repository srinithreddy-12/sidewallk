"use client";

import { useState } from "react";
import { faceMatrix, iso, readableInk, shade } from "@/lib/iso";
import { IsoBox } from "@/components/scene/IsoBox";
import { RoofGable } from "@/components/scene/RoofGable";
import { ExteriorFacade } from "./ExteriorFacade";
import type { Building as BuildingModel } from "@/lib/types";

export const BUILDING_WIDTH = 2.2;
export const BUILDING_DEPTH = 2;
export const BUILDING_HEIGHT = 1.3;
export const BUILDING_SPACING = 3.3;

const ROOF_COLOR = "#453a33";
const ROOF_RISE = 0.5;
const ROOF_OVERHANG = 0.16;

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

/** A small flower box: a low planter with three or four rounded blooms, seeded so the cluster looks hand-placed but stays stable. */
function FlowerBox({ u, v, width, scale, seed }: { u: number; v: number; width: number; scale: number; seed: number }) {
  const bloomTones = ["#c97b5f", "#d9a441", "#a65a6e", "#8a9a5b"];
  const count = 4;
  const blooms = Array.from({ length: count }, (_, i) => {
    const t = (i + 0.5) / count;
    const jitter = ((seed * (i + 1) * 97) % 10) / 100 - 0.05;
    const top = iso(u + width * t + jitter, v - 0.06, 0.26, scale);
    return { top, tone: bloomTones[(i + Math.floor(seed * 10)) % bloomTones.length]! };
  });
  return (
    <g>
      <IsoBox u={u} v={v - 0.12} w={width} d={0.14} h={0.15} scale={scale} bodyColor="#6b5440" />
      {blooms.map((bloom, i) => (
        <ellipse key={i} cx={bloom.top.x} cy={bloom.top.y} rx={7} ry={6} fill={bloom.tone} />
      ))}
    </g>
  );
}

export function Building({ building, name, scale, onActivate, highlighted }: BuildingProps) {
  const [focused, setFocused] = useState(false);
  const { u, v } = buildingOrigin(building.position);
  const isBoutique = building.exterior === "press-front";

  const faceV = v + BUILDING_DEPTH;
  const corner00 = iso(u, faceV, BUILDING_HEIGHT, scale);
  const corner10 = iso(u + BUILDING_WIDTH, faceV, BUILDING_HEIGHT, scale);
  const corner01 = iso(u, faceV, 0, scale);
  const matrix = faceMatrix(corner00, corner10, corner01);

  const labelPoint = iso(u + BUILDING_WIDTH / 2, faceV + 0.55, 0, scale);
  const roofPoint = iso(u + BUILDING_WIDTH / 2, faceV, BUILDING_HEIGHT, scale);
  const signPoint = iso(u + BUILDING_WIDTH * 0.81, faceV, BUILDING_HEIGHT * 0.92, scale);
  const signBracket = iso(u + BUILDING_WIDTH * 0.81, faceV, BUILDING_HEIGHT * 1.0, scale);

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

      {isBoutique ? (
        <>
          <RoofGable
            u={u}
            v={v}
            w={BUILDING_WIDTH}
            d={BUILDING_DEPTH}
            h={BUILDING_HEIGHT}
            rise={ROOF_RISE}
            overhang={ROOF_OVERHANG}
            scale={scale}
            roofColor={ROOF_COLOR}
          />
          <FlowerBox u={u + 0.09 * BUILDING_WIDTH} v={faceV} width={0.46 * BUILDING_WIDTH} scale={scale} seed={0.37} />
          <line
            x1={signBracket.x}
            y1={signBracket.y}
            x2={signPoint.x - 2}
            y2={signPoint.y - 10}
            stroke={shade(building.trimColor, -0.3)}
            strokeWidth={2}
          />
          <g transform={`translate(${signPoint.x}, ${signPoint.y})`}>
            <rect x={-44} y={-11} width={88} height={20} rx={3} fill={building.trimColor} stroke={shade(building.trimColor, -0.25)} />
            <text x={0} y={3} textAnchor="middle" fontSize={10} fontWeight={700} fill={readableInk(building.trimColor)}>
              {building.signText}
            </text>
          </g>
        </>
      ) : (
        <g transform={`translate(${roofPoint.x}, ${roofPoint.y - 6})`}>
          <rect x={-46} y={-16} width={92} height={18} rx={4} fill={building.trimColor} opacity={0.92} />
          <text x={0} y={-3} textAnchor="middle" fontSize={10} fontWeight={700} fill={readableInk(building.trimColor)}>
            {building.signText}
          </text>
        </g>
      )}

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
