"use client";

import { useTown } from "@/lib/store";
import { createProp, moveProp, removeProp, updatePropContent } from "@/lib/room-edit";
import type { InteriorTemplate, Member, MemberCategory, RoomPropKind } from "@/lib/types";
import { MemberFieldsEditor } from "./MemberFieldsEditor";
import { RoomAppearanceEditor } from "./RoomAppearanceEditor";
import { PropsEditor } from "./PropsEditor";
import styles from "./EditorPanel.module.css";

interface EditorPanelProps {
  member: Member;
  onClose: () => void;
}

export function EditorPanel({ member, onClose }: EditorPanelProps) {
  const { overrides, saveStatus, updateMember, resetMember } = useTown();
  const hasOverride = member.id in overrides;

  return (
    <section className={styles.panel} aria-label={`Edit ${member.name}`}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h2>Edit this room</h2>
          <span className="sample-badge">Local demo editor</span>
        </div>
        <button type="button" className="button button--small" onClick={onClose}>
          Done editing
        </button>
      </div>
      <p className="field__hint">
        Changes save to this browser only, under your own control — nothing here represents real authorization.
      </p>

      <details className={styles.section} open>
        <summary>Member details</summary>
        <div className={styles.sectionBody}>
          <MemberFieldsEditor
            member={member}
            onChangeName={(value) => updateMember(member.id, { name: value })}
            onChangeDescription={(value) => updateMember(member.id, { description: value })}
            onChangeCategory={(value: MemberCategory) => updateMember(member.id, { category: value })}
            onChangeActionLabel={(value) => updateMember(member.id, { action: { ...member.action, label: value } })}
            onChangeActionUrl={(value) => updateMember(member.id, { action: { ...member.action, url: value } })}
          />
        </div>
      </details>

      <details className={styles.section} open>
        <summary>Room appearance</summary>
        <div className={styles.sectionBody}>
          <RoomAppearanceEditor
            room={member.room}
            onChangeTemplate={(value: InteriorTemplate) => updateMember(member.id, { room: { template: value } })}
            onChangePalette={(value) => updateMember(member.id, { room: { palette: value } })}
          />
        </div>
      </details>

      <details className={styles.section} open>
        <summary>Furniture and decor</summary>
        <div className={styles.sectionBody}>
          <PropsEditor
            room={member.room}
            onMoveProp={(propId, dx, dy) =>
              updateMember(member.id, {
                room: { props: moveProp(member.room.props, propId, dx, dy, member.room.gridWidth, member.room.gridHeight) },
              })
            }
            onRemoveProp={(propId) =>
              updateMember(member.id, { room: { props: removeProp(member.room.props, propId) } })
            }
            onUpdatePropContent={(propId, fields) =>
              updateMember(member.id, { room: { props: updatePropContent(member.room.props, propId, fields) } })
            }
            onAddProp={(kind: RoomPropKind) =>
              updateMember(member.id, { room: { props: [...member.room.props, createProp(member.room, kind, member.id)] } })
            }
          />
        </div>
      </details>

      <div className={styles.footer}>
        <span className={`${styles.status} ${saveStatus?.ok === false ? styles.statusError : ""}`} role="status">
          {saveStatus?.ok === false ? saveStatus.reason : "Changes preview immediately and are saved automatically."}
        </span>
        <button type="button" className="button" onClick={() => resetMember(member.id)} disabled={!hasOverride}>
          Reset to demo data
        </button>
      </div>
    </section>
  );
}
