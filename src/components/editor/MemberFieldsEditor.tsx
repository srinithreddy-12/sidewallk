"use client";

import { Field } from "@/components/ui/Field";
import type { Member, MemberCategory } from "@/lib/types";
import styles from "./MemberFieldsEditor.module.css";

const CATEGORIES: MemberCategory[] = ["art", "craft", "design", "food", "music", "writing"];

interface MemberFieldsEditorProps {
  member: Member;
  onChangeName: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onChangeCategory: (value: MemberCategory) => void;
  onChangeActionLabel: (value: string) => void;
  onChangeActionUrl: (value: string) => void;
}

export function MemberFieldsEditor({
  member,
  onChangeName,
  onChangeDescription,
  onChangeCategory,
  onChangeActionLabel,
  onChangeActionUrl,
}: MemberFieldsEditorProps) {
  return (
    <div className={styles.grid}>
      <Field label="Name" htmlFor="edit-name">
        <input id="edit-name" type="text" value={member.name} onChange={(e) => onChangeName(e.target.value)} />
      </Field>
      <Field label="Category" htmlFor="edit-category">
        <select id="edit-category" value={member.category} onChange={(e) => onChangeCategory(e.target.value as MemberCategory)}>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </Field>
      <div className={styles.full}>
        <Field label="Description" htmlFor="edit-description">
          <textarea id="edit-description" value={member.description} onChange={(e) => onChangeDescription(e.target.value)} />
        </Field>
      </div>
      <div className={`${styles.full} ${styles.linkRow}`}>
        <Field label="Action button label" htmlFor="edit-action-label">
          <input id="edit-action-label" type="text" value={member.action.label} onChange={(e) => onChangeActionLabel(e.target.value)} />
        </Field>
        <Field label="Action link URL" htmlFor="edit-action-url" hint="http:, https: or mailto: only">
          <input id="edit-action-url" type="text" value={member.action.url} onChange={(e) => onChangeActionUrl(e.target.value)} />
        </Field>
      </div>
    </div>
  );
}
