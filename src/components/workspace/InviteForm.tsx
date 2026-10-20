"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TownRole } from "@/lib/access";
import type { PublicMember } from "@/lib/repository/convert";
import { createInvitationAction } from "@/app/workspace/towns/[townId]/actions";
import styles from "./InviteForm.module.css";

export function InviteForm({ townId, members }: { townId: string; members: PublicMember[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TownRole>("member");
  const [memberId, setMemberId] = useState(members[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setLink(null);
    setCopied(false);

    const result = await createInvitationAction(townId, {
      role,
      memberId: role === "member" ? memberId || null : null,
      email,
    });
    setPending(false);

    if (!result.ok) {
      setError(result.reason);
      return;
    }
    setEmail("");
    setLink(`${window.location.origin}/invite/${result.data.token}`);
    router.refresh();
  }

  return (
    <div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="invite-email">Email address</label>
            <input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="invite-role">Role</label>
            <select id="invite-role" value={role} onChange={(e) => setRole(e.target.value as TownRole)}>
              <option value="member">Member</option>
              <option value="organizer">Organizer</option>
            </select>
          </div>
        </div>
        {role === "member" ? (
          <div className={styles.field}>
            <label htmlFor="invite-member">Assigned building</label>
            {members.length === 0 ? (
              <p className={styles.error}>Add a member first — a member invitation needs a building to assign.</p>
            ) : (
              <select id="invite-member" value={memberId} onChange={(e) => setMemberId(e.target.value)} required>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name || "Untitled member"}
                  </option>
                ))}
              </select>
            )}
          </div>
        ) : null}
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        <button
          className="button button--primary"
          type="submit"
          disabled={pending || (role === "member" && members.length === 0)}
        >
          {pending ? "Creating invite…" : "Create invite link"}
        </button>
      </form>

      {link ? (
        <div className={styles.linkBox} role="status">
          <p>Share this link with {email || "the invitee"} — it works once and expires in 7 days.</p>
          <div className={styles.linkRow}>
            <input readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Invitation link" />
            <button
              type="button"
              className="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(link);
                  setCopied(true);
                } catch {
                  setCopied(false);
                }
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
