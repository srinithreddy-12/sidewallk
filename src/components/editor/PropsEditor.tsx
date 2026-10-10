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
  // Switching templates changes `palette`; `selectedKind` can still hold a kind from the
  // old one. Clamp at render time (not via an effect) so there's no gap where a stale
  // kind could reach Add — this is correct even if Add is clicked immediately after
  // switching templates, before any effect would have had a chance to run.
  const effectiveKind: RoomPropKind = palette.includes(selectedKind) ? selectedKind : (palette[0] ?? "plant");

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
          <select id="add-prop-kind" value={effectiveKind} onChange={(e) => setSelectedKind(e.target.value as RoomPropKind)}>
            {palette.map((kind) => (
              <option key={kind} value={kind}>
                {PROP_REGISTRY[kind].label}
              </option>
            ))}
          </select>
        </Field>
        <button type="button" className="button" onClick={() => onAddProp(effectiveKind)}>
          Add
        </button>
      </div>
    </div>
  );
}
