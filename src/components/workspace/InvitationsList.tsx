"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { InvitationSummary } from "@/lib/repository/invitations";
import { revokeInvitationAction } from "@/app/workspace/towns/[townId]/actions";
import styles from "./InvitationsList.module.css";

function statusOf(invite: InvitationSummary): "accepted" | "revoked" | "expired" | "pending" {
  if (invite.acceptedAt) return "accepted";
  if (invite.revokedAt) return "revoked";
  if (new Date(invite.expiresAt).getTime() < Date.now()) return "expired";
  return "pending";
}

export function InvitationsList({ townId, invitations }: { townId: string; invitations: InvitationSummary[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRevoke(id: string) {
    setPendingId(id);
    setError(null);
    const result = await revokeInvitationAction(townId, id);
    setPendingId(null);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    router.refresh();
  }

  if (invitations.length === 0) {
    return <p className={styles.empty}>No invitations yet.</p>;
  }

  return (
    <div>
      {error ? (
        <p role="alert" style={{ color: "#9a3b2d", fontSize: 12 }}>
          {error}
        </p>
      ) : null}
      <ul className={styles.list}>
        {invitations.map((invite) => {
          const status = statusOf(invite);
          return (
            <li key={invite.id} className={styles.row}>
              <div className={styles.meta}>
                <strong>{invite.invitedEmail}</strong>
                <span className={styles.statusLine}>
                  {invite.role} · {status}
                  {status === "pending" ? ` · expires ${new Date(invite.expiresAt).toLocaleDateString()}` : ""}
                </span>
              </div>
              {status === "pending" ? (
                <button type="button" onClick={() => handleRevoke(invite.id)} disabled={pendingId === invite.id}>
                  {pendingId === invite.id ? "Revoking…" : "Revoke"}
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
