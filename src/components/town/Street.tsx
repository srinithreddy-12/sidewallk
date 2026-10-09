"use client";

import { useMemo, useRef, useState } from "react";
import { isoDepth } from "@/lib/iso";
import type { Member } from "@/lib/types";
import { Building, buildingOrigin, BUILDING_SPACING, BUILDING_WIDTH } from "./Building";
import styles from "./Street.module.css";

const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 560;
const BASE_SCALE = 70;
const MIN_ZOOM = 0.6;
const MAX_ZOOM = 2;
const PAN_STEP = 40;

interface StreetProps {
  members: Member[];
  highlightedId: string | null;
  onEnter: (memberId: string) => void;
}

export function Street({ members, highlightedId, onEnter }: StreetProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: VIEW_WIDTH * 0.1, y: VIEW_HEIGHT * 0.55 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const sceneWidth = (members.length - 1) * BUILDING_SPACING + BUILDING_WIDTH;
  const maxPanX = BASE_SCALE * sceneWidth + 400;
  const maxPanY = 400;

  const clampPan = (next: { x: number; y: number }) => ({
    x: Math.max(-maxPanX, Math.min(maxPanX, next.x)),
    y: Math.max(-maxPanY, Math.min(maxPanY, next.y)),
  });

  const scale = BASE_SCALE * zoom;

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const originA = buildingOrigin(a.building.position);
      const originB = buildingOrigin(b.building.position);
      return isoDepth(originA.u, originA.v, 0) - isoDepth(originB.u, originB.v, 0);
    });
  }, [members]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.target !== containerRef.current) return;
    switch (event.key) {
      case "ArrowLeft":
        setPan((p) => clampPan({ ...p, x: p.x + PAN_STEP }));
        event.preventDefault();
        break;
      case "ArrowRight":
        setPan((p) => clampPan({ ...p, x: p.x - PAN_STEP }));
        event.preventDefault();
        break;
      case "ArrowUp":
        setPan((p) => clampPan({ ...p, y: p.y + PAN_STEP }));
        event.preventDefault();
        break;
      case "ArrowDown":
        setPan((p) => clampPan({ ...p, y: p.y - PAN_STEP }));
        event.preventDefault();
        break;
      case "+":
      case "=":
        setZoom((z) => Math.min(MAX_ZOOM, z + 0.15));
        event.preventDefault();
        break;
      case "-":
      case "_":
        setZoom((z) => Math.max(MIN_ZOOM, z - 0.15));
        event.preventDefault();
        break;
      default:
        break;
    }
  }

  return (
    <div className={styles.wrapper}>
      <div
        ref={containerRef}
        role="group"
        aria-label="Town street. Use arrow keys to pan, plus and minus to zoom, and Tab to move between buildings."
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <svg className={styles.svg} viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}>
          <g className={styles.scene} transform={`translate(${pan.x}, ${pan.y})`}>
            {sortedMembers.map((member) => (
              <Building
                key={member.id}
                building={member.building}
                name={member.name}
                scale={scale}
                onActivate={() => onEnter(member.id)}
                highlighted={highlightedId === member.id}
              />
            ))}
            {members.length === 0 ? (
              <text x={0} y={0} textAnchor="middle" fill="var(--color-ink-soft)" fontSize={16}>
                No members match your search.
              </text>
            ) : null}
          </g>
        </svg>
      </div>
      <div className={styles.controls}>
        <div className={styles.controlsRow}>
          <button
            type="button"
            className="button button--small"
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 0.15))}
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            className="button button--small"
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 0.15))}
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
        <button
          type="button"
          className="button button--small"
          onClick={() => {
            setZoom(1);
            setPan({ x: VIEW_WIDTH * 0.1, y: VIEW_HEIGHT * 0.55 });
          }}
        >
          Reset view
        </button>
      </div>
    </div>
  );
}
