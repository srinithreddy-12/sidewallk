"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [saveStatus, setSaveStatus] = useState<EditorSaveStatus | null>(null);
  const [conflict, setConflict] = useState(false);
  const memberRef = useRef(initialMember);
  const versionRef = useRef(initialVersion);
  const pendingMemberRef = useRef<Member | null>(null);
  const savingRef = useRef(false);
  const conflictRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    memberRef.current = initialMember;
    versionRef.current = initialVersion;
    pendingMemberRef.current = null;
    conflictRef.current = false;
    setMember(initialMember);
    setConflict(false);
    setSaveStatus(null);
  }, [initialMember, initialVersion]);

  const flushPendingSave = useCallback(async function flushPendingSave() {
    if (savingRef.current || conflictRef.current) return;

    const snapshot = pendingMemberRef.current;
    if (!snapshot) return;

    pendingMemberRef.current = null;
    savingRef.current = true;

    const result = await updateMemberAction(
      townId,
      snapshot.id,
      {
        name: snapshot.name,
        category: snapshot.category,
        description: snapshot.description,
        action: snapshot.action,
        room: snapshot.room,
      },
      versionRef.current,
    );
    savingRef.current = false;
    if (!mountedRef.current) return;

    if (result.ok) {
      versionRef.current = result.data.version;
      if (pendingMemberRef.current) {
        void flushPendingSave();
      } else {
        setSaveStatus({ ok: true });
      }
      return;
    }

    if (result.reason === "conflict") {
      conflictRef.current = true;
      pendingMemberRef.current = null;
      setConflict(true);
      setSaveStatus({ ok: false, reason: "This member changed elsewhere. Reload to see the latest version." });
      return;
    }

    // Keep the newest optimistic snapshot available. The next deliberate edit
    // retries the full current state rather than dropping text typed while the
    // failed request was in flight.
    pendingMemberRef.current = memberRef.current;
    setSaveStatus({
      ok: false,
      reason: result.reason === "invalid" ? result.message : "Could not save changes. Try again.",
    });
  }, [townId]);

  const handlePatch = useCallback((patch: MemberOverride) => {
    if (conflictRef.current) return;

    const next = applyOverride(memberRef.current, patch);
    memberRef.current = next;
    pendingMemberRef.current = next;
    setMember(next);
    setSaveStatus(null);
    void flushPendingSave();
  }, [flushPendingSave]);

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
