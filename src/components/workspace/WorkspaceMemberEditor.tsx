"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditorPanel, type EditorSaveStatus } from "@/components/editor/EditorPanel";
import { RoomScene } from "@/components/interior/RoomScene";
import { applyOverride } from "@/lib/storage";
import type { Member, MemberOverride } from "@/lib/types";
import { updateMemberAction } from "@/app/workspace/towns/[townId]/actions";
import styles from "./WorkspaceMemberEditor.module.css";

/**
 * The production, Supabase-backed counterpart to LocalEditorPanel. Same
 * EditorPanel and RoomScene, same editing affordances — the only thing that
 * differs is where `onPatch` sends the result and how it reacts to a
 * version conflict. Each patch is merged against the member we last saw
 * (applyOverride, the same merge the local demo override layer uses) and
 * sent in full, tagged with the version we last saw; a stale version comes
 * back as a distinct "conflict" result instead of silently overwriting
 * someone else's change.
 */
export function WorkspaceMemberEditor({
  townId,
  initialMember,
  initialVersion,
}: {
  townId: string;
  initialMember: Member;
  initialVersion: number;
}) {
  const router = useRouter();
  const [member, setMember] = useState(initialMember);
  const [version, setVersion] = useState(initialVersion);
  const [saveStatus, setSaveStatus] = useState<EditorSaveStatus | null>(null);
  const [conflict, setConflict] = useState(false);

  async function handlePatch(patch: MemberOverride) {
    if (conflict) return;
    const next = applyOverride(member, patch);
    setMember(next);

    const result = await updateMemberAction(
      townId,
      next.id,
      {
        name: next.name,
        category: next.category,
        description: next.description,
        action: next.action,
        room: next.room,
      },
      version,
    );

    if (result.ok) {
      setVersion(result.data.version);
      setSaveStatus({ ok: true });
      return;
    }

    if (result.reason === "conflict") {
      setConflict(true);
      setSaveStatus({ ok: false, reason: "This member changed elsewhere. Reload to see the latest version." });
      return;
    }

    setSaveStatus({
      ok: false,
      reason: result.reason === "invalid" ? result.message : "Could not save changes. Try again.",
    });
  }

  return (
    <div>
      {conflict ? (
        <div className={styles.conflict} role="alert">
          <span>This member was changed elsewhere. Your edits since then were not saved.</span>
          <button type="button" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      ) : null}
      <RoomScene room={member.room} memberId={member.id} />
      <EditorPanel
        member={member}
        onClose={() => router.push(`/workspace/towns/${townId}`)}
        onPatch={handlePatch}
        saveStatus={saveStatus}
        sampleMode={false}
      />
    </div>
  );
}
