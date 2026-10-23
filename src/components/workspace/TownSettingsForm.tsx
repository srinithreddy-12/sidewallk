"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTownNameAction } from "@/app/workspace/towns/[townId]/actions";
import type { RunTownMutation } from "./TownManagementControls";
import styles from "./TownSettingsForm.module.css";

export function TownSettingsForm({
  townId,
  initialName,
  mutationPending,
  runMutation,
}: {
  townId: string;
  initialName: string;
  mutationPending: boolean;
  runMutation: RunTownMutation;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await runMutation((version) => updateTownNameAction(townId, name, version));
    if (!result) return;

    if (result.ok) {
      setMessage({ kind: "success", text: "Saved." });
      router.refresh();
      return;
    }
    if (result.reason === "conflict") {
      setMessage({ kind: "error", text: "This town's settings changed elsewhere. Reload the page to see the latest." });
      return;
    }
    setMessage({ kind: "error", text: result.reason === "invalid" ? result.message : "Could not save. Try again." });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="town-name-field">Town name</label>
        <input id="town-name-field" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      {message ? (
        <p className={`${styles.message} ${message.kind === "error" ? styles.error : styles.success}`} role="status">
          {message.text}
        </p>
      ) : null}
      <button className="button" type="submit" disabled={mutationPending}>
        {mutationPending ? "Saving…" : "Save name"}
      </button>
    </form>
  );
}
