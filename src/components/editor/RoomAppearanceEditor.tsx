"use client";

import { Field } from "@/components/ui/Field";
import { ROOM_PALETTE_OPTIONS } from "@/lib/prop-registry";
import type { InteriorTemplate, Room } from "@/lib/types";
import styles from "./RoomAppearanceEditor.module.css";

const TEMPLATES: InteriorTemplate[] = ["gallery", "studio", "shop"];

interface RoomAppearanceEditorProps {
  room: Room;
  onChangeTemplate: (template: InteriorTemplate) => void;
  onChangePalette: (palette: string) => void;
}

export function RoomAppearanceEditor({ room, onChangeTemplate, onChangePalette }: RoomAppearanceEditorProps) {
  return (
    <div className={styles.row}>
      <Field label="Interior template" htmlFor="edit-template">
        <select
          id="edit-template"
          value={room.template}
          onChange={(e) => onChangeTemplate(e.target.value as InteriorTemplate)}
        >
          {TEMPLATES.map((template) => (
            <option key={template} value={template}>
              {template}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Room colour" htmlFor="room-palette-group">
        <div className={styles.swatches} id="room-palette-group" role="group" aria-label="Room colour">
          {ROOM_PALETTE_OPTIONS.map((hex) => (
            <button
              key={hex}
              type="button"
              className={styles.swatch}
              style={{ background: hex }}
              aria-pressed={room.palette === hex}
              aria-label={`Set room colour to ${hex}`}
              onClick={() => onChangePalette(hex)}
            />
          ))}
        </div>
      </Field>
    </div>
  );
}
