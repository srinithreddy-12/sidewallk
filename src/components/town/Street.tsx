"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { iso, isoDepth } from "@/lib/iso";
import type { Member } from "@/lib/types";
import { Building, buildingOrigin, BUILDING_DEPTH, BUILDING_SPACING, BUILDING_WIDTH } from "./Building";
import { StreetGround } from "./StreetGround";
import styles from "./Street.module.css";

const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 560;
const BASE_SCALE = 70;
const MIN_ZOOM = 0.6;
const MAX_ZOOM = 2;
const PAN_STEP = 40;
// Chosen so Reset View frames the first few buildings with their name labels
// fully on-screen and a small, deliberate sky margin above the rooflines —
// see Street composition notes in MILESTONE.md for the measurements behind
// these numbers.
const DEFAULT_PAN = { x: 160, y: 130 };

interface StreetProps {
  members: Member[];
  /** The full, unfiltered member count — used to tell "searched down" apart from "showing everyone". */
  totalCount: number;
  highlightedId: string | null;
  onEnter: (memberId: string) => void;
}

export function Street({ members, totalCount, highlightedId, onEnter }: StreetProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState(DEFAULT_PAN);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragState = useRef<{ pointerId: number; startClientX: number; startClientY: number; startPan: { x: number; y: number } } | null>(
    null,
  );

  const sceneWidth = (members.length - 1) * BUILDING_SPACING + BUILDING_WIDTH;
  const maxPanX = BASE_SCALE * sceneWidth + 400;
  const maxPanY = 400;

  const clampPan = (next: { x: number; y: number }) => ({
    x: Math.max(-maxPanX, Math.min(maxPanX, next.x)),
    y: Math.max(-maxPanY, Math.min(maxPanY, next.y)),
  });

  const scale = BASE_SCALE * zoom;

  // Search narrows `members` below `totalCount` — bring the results into view
  // rather than leaving them wherever the street happened to be panned.
  const resultsKey = members.map((m) => m.id).join(",");
  useEffect(() => {
    if (members.length === 0) return;
    if (members.length >= totalCount) {
      setZoom(1);
      setPan(DEFAULT_PAN);
      return;
    }
    const positions = members.map((m) => buildingOrigin(m.building.position).u);
    const minU = Math.min(...positions);
    const maxU = Math.max(...positions) + BUILDING_WIDTH;
    const spanU = Math.max(maxU - minU, BUILDING_WIDTH);
    const centerU = (minU + maxU) / 2;

    const fitWidthPx = VIEW_WIDTH * 0.6;
    const spanPxAtBaseScale = spanU * Math.cos(Math.PI / 6) * BASE_SCALE;
    const fitZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, fitWidthPx / spanPxAtBaseScale));
    const nextZoom = Math.min(1.4, fitZoom);
    const nextScale = BASE_SCALE * nextZoom;

    const center = iso(centerU, BUILDING_DEPTH / 2, 0, nextScale);
    setZoom(nextZoom);
    setPan({ x: VIEW_WIDTH / 2 - center.x, y: VIEW_HEIGHT * 0.5 - center.y });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultsKey, totalCount]);

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const originA = buildingOrigin(a.building.position);
      const originB = buildingOrigin(b.building.position);
      return isoDepth(originA.u, originA.v, 0) - isoDepth(originB.u, originB.v, 0);
    });
  }, [members]);

  function panBy(dx: number, dy: number) {
    setPan((p) => clampPan({ x: p.x + dx, y: p.y + dy }));
  }

  // Pointer Events cover mouse, touch and pen in one handler, so dragging the
  // street to pan works the same with a finger as it does with a mouse.
  function handlePointerDown(event: React.PointerEvent<SVGSVGElement>) {
    if (event.button !== undefined && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startPan: pan,
    };
    setIsDragging(true);
  }

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    const scaleX = VIEW_WIDTH / rect.width;
    const scaleY = VIEW_HEIGHT / rect.height;
    const dx = (event.clientX - drag.startClientX) * scaleX;
    const dy = (event.clientY - drag.startClientY) * scaleY;
    setPan(clampPan({ x: drag.startPan.x + dx, y: drag.startPan.y + dy }));
    event.preventDefault();
  }

  function handlePointerUp(event: React.PointerEvent<SVGSVGElement>) {
    if (dragState.current?.pointerId !== event.pointerId) return;
    dragState.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

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
        <svg
          ref={svgRef}
          className={styles.svg}
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <g
            className={isDragging ? `${styles.scene} ${styles.dragging}` : styles.scene}
            transform={`translate(${pan.x}, ${pan.y})`}
          >
            <StreetGround slotCount={totalCount} scale={scale} />
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
        <div className={styles.pad} role="group" aria-label="Pan the street">
          <button type="button" className={`button button--small ${styles.padUp}`} aria-label="Pan up" onClick={() => panBy(0, PAN_STEP)}>
            ↑
          </button>
          <button type="button" className={`button button--small ${styles.padLeft}`} aria-label="Pan left" onClick={() => panBy(PAN_STEP, 0)}>
            ←
          </button>
          <button type="button" className={`button button--small ${styles.padDown}`} aria-label="Pan down" onClick={() => panBy(0, -PAN_STEP)}>
            ↓
          </button>
          <button type="button" className={`button button--small ${styles.padRight}`} aria-label="Pan right" onClick={() => panBy(-PAN_STEP, 0)}>
            →
          </button>
        </div>
        <div className={styles.controlsRow}>
          <button
            type="button"
            className="button"
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 0.15))}
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            className="button"
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 0.15))}
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
        <button
          type="button"
          className="button"
          onClick={() => {
            setZoom(1);
            setPan(DEFAULT_PAN);
          }}
        >
          Reset view
        </button>
      </div>
    </div>
  );
}
