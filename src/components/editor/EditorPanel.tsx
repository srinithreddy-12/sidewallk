"use client";

import { createProp, moveProp, removeProp, updatePropContent } from "@/lib/room-edit";
import type { InteriorTemplate, Member, MemberCategory, MemberOverride, RoomPropKind } from "@/lib/types";
import { MemberFieldsEditor } from "./MemberFieldsEditor";
import { RoomAppearanceEditor } from "./RoomAppearanceEditor";
import { PropsEditor } from "./PropsEditor";
import styles from "./EditorPanel.module.css";

export interface EditorSaveStatus {
  ok: boolean;
  reason?: string;
}

interface EditorPanelProps {
  member: Member;
  onClose: () => void;
  /** Applies one patch — to local-storage overrides in the demo, to a Supabase update in production. */
  onPatch: (patch: MemberOverride) => void;
  saveStatus: EditorSaveStatus | null;
  /** Omitted entirely (not shown) when there is nothing meaningful to reset to — production members have no demo fallback. */
  onReset?: () => void;
  resettable?: boolean;
  /** The "local demo editor" badge and copy only apply to the one local sample town. */
  sampleMode?: boolean;
}

/**
 * Pure, reusable room/member editor — the same one the local sample editor
 * and the production organizer/member workspace editor both render. Holds
 * no opinion on how `onPatch` actually persists; see LocalEditorPanel for
 * the local-storage-backed demo wiring and WorkspaceMemberEditor for the
 * Supabase-backed production wiring.
 */
export function EditorPanel({
  member,
  onClose,
  onPatch,
  saveStatus,
  onReset,
  resettable = false,
  sampleMode = true,
}: EditorPanelProps) {
  return (
    <section className={styles.panel} aria-label={`Edit ${member.name}`}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h2>Edit this room</h2>
          {sampleMode ? <span className="sample-badge">Local demo editor</span> : null}
        </div>
        <button type="button" className="button button--small" onClick={onClose}>
          Done editing
        </button>
      </div>
      {sampleMode ? (
        <p className="field__hint">
          Changes save to this browser only, under your own control — nothing here represents real authorization.
        </p>
      ) : null}

      <details className={styles.section} open>
        <summary>Member details</summary>
        <div className={styles.sectionBody}>
          <MemberFieldsEditor
            member={member}
            onChangeName={(value) => onPatch({ name: value })}
            onChangeDescription={(value) => onPatch({ description: value })}
            onChangeCategory={(value: MemberCategory) => onPatch({ category: value })}
            onChangeActionLabel={(value) => onPatch({ action: { ...member.action, label: value } })}
            onChangeActionUrl={(value) => onPatch({ action: { ...member.action, url: value } })}
          />
        </div>
      </details>

      <details className={styles.section} open>
        <summary>Room appearance</summary>
        <div className={styles.sectionBody}>
          <RoomAppearanceEditor
            room={member.room}
            onChangeTemplate={(value: InteriorTemplate) => onPatch({ room: { template: value } })}
            onChangePalette={(value) => onPatch({ room: { palette: value } })}
          />
        </div>
      </details>

      <details className={styles.section} open>
        <summary>Furniture and decor</summary>
        <div className={styles.sectionBody}>
          <PropsEditor
            room={member.room}
            onMoveProp={(propId, dx, dy) =>
              onPatch({
                room: { props: moveProp(member.room.props, propId, dx, dy, member.room.gridWidth, member.room.gridHeight) },
              })
            }
            onRemoveProp={(propId) => onPatch({ room: { props: removeProp(member.room.props, propId) } })}
            onUpdatePropContent={(propId, fields) =>
              onPatch({ room: { props: updatePropContent(member.room.props, propId, fields) } })
            }
            onAddProp={(kind: RoomPropKind) =>
              onPatch({ room: { props: [...member.room.props, createProp(member.room, kind, member.id)] } })
            }
          />
        </div>
      </details>

      <div className={styles.footer}>
        <span className={`${styles.status} ${saveStatus?.ok === false ? styles.statusError : ""}`} role="status">
          {saveStatus?.ok === false
            ? saveStatus.reason
            : sampleMode
              ? "Changes preview immediately and are saved automatically."
              : "Changes save automatically."}
        </span>
        {onReset ? (
          <button type="button" className="button" onClick={onReset} disabled={!resettable}>
            Reset to demo data
          </button>
        ) : null}
      </div>
    </section>
  );
}
