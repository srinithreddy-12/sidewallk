"use client";

import { useMemo, useState } from "react";
import { faceColors, iso, isoDepth, shade } from "@/lib/iso";
import { PROP_REGISTRY } from "@/lib/prop-registry";
import type { Room, RoomProp as RoomPropModel } from "@/lib/types";
import { RoomPropView } from "./RoomProp";
import { ContentPanel } from "./ContentPanel";
import { PapermothStudioDecor } from "./PapermothStudioDecor";
import styles from "./RoomScene.module.css";

const SCALE = 85;
const WALL_HEIGHT = 2.1;
const VIEW_WIDTH = 900;
const VIEW_HEIGHT = 580;

/** Members whose gallery template gets this milestone's richer treatment — see MILESTONE.md. Scoped by id so every other room renders exactly as before. */
const RICH_DECOR_MEMBER_ID = "papermoth-press";

interface RoomSceneProps {
  room: Room;
  /** Which member this room belongs to — purely a rendering hint (not persisted) used to scope this milestone's Papermoth-only visual upgrade. */
  memberId?: string;
}

/** A soft, low-opacity contact shadow under a floor prop, drawn before every prop so it can never paint over one. Shared recipe with PapermothStudioDecor's fixed pieces, for one consistent light. */
function ContactShadow({ u, v, scale, rx, ry }: { u: number; v: number; scale: number; rx: number; ry: number }) {
  const p = iso(u, v, 0.01, scale);
  return <ellipse cx={p.x} cy={p.y + 2} rx={rx} ry={ry} fill="#2d2a26" opacity={0.16} />;
}

export function RoomScene({ room, memberId }: RoomSceneProps) {
  const [openProp, setOpenProp] = useState<RoomPropModel | null>(null);
  const colors = faceColors(room.palette);
  const richDecor = memberId === RICH_DECOR_MEMBER_ID && room.template === "gallery";

  const sortedProps = useMemo(
    () => [...room.props].sort((a, b) => isoDepth(a.x, a.y, 0) - isoDepth(b.x, b.y, 0)),
    [room.props],
  );

  const floorPoints = [
    iso(0, 0, 0, SCALE),
    iso(room.gridWidth, 0, 0, SCALE),
    iso(room.gridWidth, room.gridHeight, 0, SCALE),
    iso(0, room.gridHeight, 0, SCALE),
  ]
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  const backWallPoints = [
    iso(0, 0, 0, SCALE),
    iso(room.gridWidth, 0, 0, SCALE),
    iso(room.gridWidth, 0, WALL_HEIGHT, SCALE),
    iso(0, 0, WALL_HEIGHT, SCALE),
  ]
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  const sideWallPoints = [
    iso(0, 0, 0, SCALE),
    iso(0, room.gridHeight, 0, SCALE),
    iso(0, room.gridHeight, WALL_HEIGHT, SCALE),
    iso(0, 0, WALL_HEIGHT, SCALE),
  ]
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  const BASE_HEIGHT = 0.1;
  const RAIL_HEIGHT = 0.82;
  const backBasePoints = [
    iso(0, 0, 0, SCALE),
    iso(room.gridWidth, 0, 0, SCALE),
    iso(room.gridWidth, 0, BASE_HEIGHT, SCALE),
    iso(0, 0, BASE_HEIGHT, SCALE),
  ]
    .map((p) => `${p.x},${p.y}`)
    .join(" ");
  const sideBasePoints = [
    iso(0, 0, 0, SCALE),
    iso(0, room.gridHeight, 0, SCALE),
    iso(0, room.gridHeight, BASE_HEIGHT, SCALE),
    iso(0, 0, BASE_HEIGHT, SCALE),
  ]
    .map((p) => `${p.x},${p.y}`)
    .join(" ");
  const backRail = [iso(0, 0, RAIL_HEIGHT, SCALE), iso(room.gridWidth, 0, RAIL_HEIGHT, SCALE)];
  const sideRail = [iso(0, 0, RAIL_HEIGHT, SCALE), iso(0, room.gridHeight, RAIL_HEIGHT, SCALE)];

  const centerOffset = iso(room.gridWidth / 2, room.gridHeight / 2, 0, SCALE);
  const originX = VIEW_WIDTH / 2 - centerOffset.x;
  const originY = VIEW_HEIGHT * 0.72 - centerOffset.y;

  // Contact shadows for every floor prop, sized off its registry footprint.
  // Drawn in one pass before any prop so a shadow can never paint over one.
  const floorShadows = richDecor
    ? room.props
        .filter((prop) => PROP_REGISTRY[prop.kind].mount === "floor" && prop.kind !== "rug")
        .map((prop) => {
          const definition = PROP_REGISTRY[prop.kind];
          const cx = prop.x + definition.footprint.w / 2;
          const cy = prop.y + definition.footprint.h / 2;
          const rx = definition.footprint.w * SCALE * 0.26;
          const ry = rx * 0.4;
          return { id: prop.id, cx, cy, rx, ry };
        })
    : [];

  return (
    <div className={styles.wrapper}>
      <svg className={styles.svg} viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}>
        <g transform={`translate(${originX}, ${originY})`}>
          <polygon points={sideWallPoints} fill={colors.right} />
          <polygon points={backWallPoints} fill={colors.left} />
          <line
            x1={sideRail[0]!.x}
            y1={sideRail[0]!.y}
            x2={sideRail[1]!.x}
            y2={sideRail[1]!.y}
            stroke={shade(colors.right, -0.12)}
            strokeWidth={1.5}
            opacity={0.6}
          />
          <line
            x1={backRail[0]!.x}
            y1={backRail[0]!.y}
            x2={backRail[1]!.x}
            y2={backRail[1]!.y}
            stroke={shade(colors.left, -0.12)}
            strokeWidth={1.5}
            opacity={0.6}
          />
          <polygon points={sideBasePoints} fill={shade(colors.right, -0.2)} />
          <polygon points={backBasePoints} fill={shade(colors.left, -0.2)} />
          <polygon points={floorPoints} fill={colors.top} />
          {richDecor ? <PapermothStudioDecor scale={SCALE} /> : null}
          {floorShadows.map((shadow) => (
            <ContactShadow key={shadow.id} u={shadow.cx} v={shadow.cy} scale={SCALE} rx={shadow.rx} ry={shadow.ry} />
          ))}
          {sortedProps.map((prop) => (
            <RoomPropView key={prop.id} prop={prop} scale={SCALE} onOpenContent={setOpenProp} richDecor={richDecor} />
          ))}
        </g>
      </svg>
      {openProp?.content ? <ContentPanel content={openProp.content} onClose={() => setOpenProp(null)} /> : null}
    </div>
  );
}
