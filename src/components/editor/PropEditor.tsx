"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { PROP_REGISTRY } from "@/lib/prop-registry";
import type { RoomProp } from "@/lib/types";
import styles from "./PropEditor.module.css";

interface PropEditorProps {
  prop: RoomProp;
  onMove: (dx: number, dy: number) => void;
  onRemove: () => void;
  onUpdateContent: (fields: { title: string; description: string; linkLabel: string; linkUrl: string }) => void;
}

export function PropEditor({ prop, onMove, onRemove, onUpdateContent }: PropEditorProps) {
  const definition = PROP_REGISTRY[prop.kind];
  const [title, setTitle] = useState(prop.content?.title ?? "");
  const [description, setDescription] = useState(prop.content?.description ?? "");
  const [linkLabel, setLinkLabel] = useState(prop.content?.link?.label ?? "");
  const [linkUrl, setLinkUrl] = useState(prop.content?.link?.url ?? "");

  function commit(next: Partial<{ title: string; description: string; linkLabel: string; linkUrl: string }>) {
    onUpdateContent({
      title: next.title ?? title,
      description: next.description ?? description,
      linkLabel: next.linkLabel ?? linkLabel,
      linkUrl: next.linkUrl ?? linkUrl,
    });
  }

  return (
    <div className={styles.item}>
      <div className={styles.topRow}>
        <span className={styles.kindLabel}>{definition.label}</span>
        <div className={styles.moveControls}>
          {definition.mount === "floor" ? (
            <>
              <button type="button" className="button button--small" aria-label={`Move ${definition.label} up`} onClick={() => onMove(0, -1)}>
                ↑
              </button>
              <button type="button" className="button button--small" aria-label={`Move ${definition.label} down`} onClick={() => onMove(0, 1)}>
                ↓
              </button>
            </>
          ) : null}
          <button type="button" className="button button--small" aria-label={`Move ${definition.label} left`} onClick={() => onMove(-1, 0)}>
            ←
          </button>
          <button type="button" className="button button--small" aria-label={`Move ${definition.label} right`} onClick={() => onMove(1, 0)}>
            →
          </button>
          <button type="button" className="button button--small" onClick={onRemove} aria-label={`Remove ${definition.label}`}>
            Remove
          </button>
        </div>
      </div>

      {definition.isDisplay ? (
        <div className={styles.contentGrid}>
          <Field label="Title" htmlFor={`${prop.id}-title`}>
            <input
              id={`${prop.id}-title`}
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                commit({ title: e.target.value });
              }}
            />
          </Field>
          <Field label="Description" htmlFor={`${prop.id}-description`}>
            <input
              id={`${prop.id}-description`}
              type="text"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                commit({ description: e.target.value });
              }}
            />
          </Field>
          <Field label="Link label" htmlFor={`${prop.id}-link-label`}>
            <input
              id={`${prop.id}-link-label`}
              type="text"
              value={linkLabel}
              onChange={(e) => {
                setLinkLabel(e.target.value);
                commit({ linkLabel: e.target.value });
              }}
            />
          </Field>
          <Field label="Link URL" htmlFor={`${prop.id}-link-url`} hint="http:, https: or mailto: only">
            <input
              id={`${prop.id}-link-url`}
              type="text"
              value={linkUrl}
              onChange={(e) => {
                setLinkUrl(e.target.value);
                commit({ linkUrl: e.target.value });
              }}
            />
          </Field>
        </div>
      ) : null}
    </div>
  );
}
