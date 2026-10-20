"use client";

import { useTown } from "@/lib/store";
import type { Member } from "@/lib/types";
import { EditorPanel } from "./EditorPanel";

/** The local sample town's editor — local-storage overrides, demo badge, reset-to-demo-data. */
export function LocalEditorPanel({ member, onClose }: { member: Member; onClose: () => void }) {
  const { overrides, saveStatus, updateMember, resetMember } = useTown();
  const hasOverride = member.id in overrides;

  return (
    <EditorPanel
      member={member}
      onClose={onClose}
      onPatch={(patch) => updateMember(member.id, patch)}
      saveStatus={saveStatus}
      onReset={() => resetMember(member.id)}
      resettable={hasOverride}
      sampleMode
    />
  );
}
