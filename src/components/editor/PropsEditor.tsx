"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { PROP_REGISTRY, TEMPLATE_PROP_PALETTE } from "@/lib/prop-registry";
import type { Room, RoomPropKind } from "@/lib/types";
import { PropEditor } from "./PropEditor";
import styles from "./PropsEditor.module.css";

interface PropsEditorProps {
  room: Room;
  onMoveProp: (propId: string, dx: number, dy: number) => void;
  onRemoveProp: (propId: string) => void;
  onUpdatePropContent: (propId: string, fields: { title: string; description: string; linkLabel: string; linkUrl: string }) => void;
  onAddProp: (kind: RoomPropKind) => void;
}

export function PropsEditor({ room, onMoveProp, onRemoveProp, onUpdatePropContent, onAddProp }: PropsEditorProps) {
  const palette = TEMPLATE_PROP_PALETTE[room.template] ?? [];
  const [selectedKind, setSelectedKind] = useState<RoomPropKind>(palette[0] ?? "plant");

  return (
    <div>
      <div className={styles.list}>
        {room.props.length === 0 ? <p className={styles.empty}>No furniture or decor yet.</p> : null}
        {room.props.map((prop) => (
          <PropEditor
            key={prop.id}
            prop={prop}
            onMove={(dx, dy) => onMoveProp(prop.id, dx, dy)}
            onRemove={() => onRemoveProp(prop.id)}
            onUpdateContent={(fields) => onUpdatePropContent(prop.id, fields)}
          />
        ))}
      </div>
      <div className={styles.addRow}>
        <Field label="Add furniture or decor" htmlFor="add-prop-kind">
          <select id="add-prop-kind" value={selectedKind} onChange={(e) => setSelectedKind(e.target.value as RoomPropKind)}>
            {palette.map((kind) => (
              <option key={kind} value={kind}>
                {PROP_REGISTRY[kind].label}
              </option>
            ))}
          </select>
        </Field>
        <button type="button" className="button" onClick={() => onAddProp(selectedKind)}>
          Add
        </button>
      </div>
    </div>
  );
}
