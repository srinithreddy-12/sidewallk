"use client";

import { useMemo, useState } from "react";
import { faceColors, iso, isoDepth } from "@/lib/iso";
import type { Room, RoomProp as RoomPropModel } from "@/lib/types";
import { RoomPropView } from "./RoomProp";
import { ContentPanel } from "./ContentPanel";
import styles from "./RoomScene.module.css";

const SCALE = 85;
const WALL_HEIGHT = 2.1;
const VIEW_WIDTH = 900;
const VIEW_HEIGHT = 580;

interface RoomSceneProps {
  room: Room;
}

export function RoomScene({ room }: RoomSceneProps) {
  const [openProp, setOpenProp] = useState<RoomPropModel | null>(null);
  const colors = faceColors(room.palette);

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

  const centerOffset = iso(room.gridWidth / 2, room.gridHeight / 2, 0, SCALE);
  const originX = VIEW_WIDTH / 2 - centerOffset.x;
  const originY = VIEW_HEIGHT * 0.78 - centerOffset.y;

  return (
    <div className={styles.wrapper}>
      <svg className={styles.svg} viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}>
        <g transform={`translate(${originX}, ${originY})`}>
          <polygon points={sideWallPoints} fill={colors.right} />
          <polygon points={backWallPoints} fill={colors.left} />
          <polygon points={floorPoints} fill={colors.top} />
          {sortedProps.map((prop) => (
            <RoomPropView key={prop.id} prop={prop} scale={SCALE} onOpenContent={setOpenProp} />
          ))}
        </g>
      </svg>
      {openProp?.content ? <ContentPanel content={openProp.content} onClose={() => setOpenProp(null)} /> : null}
    </div>
  );
}
