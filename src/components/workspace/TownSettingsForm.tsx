"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTownNameAction } from "@/app/workspace/towns/[townId]/actions";
import styles from "./TownSettingsForm.module.css";

export function TownSettingsForm({
  townId,
  initialName,
  initialVersion,
}: {
  townId: string;
  initialName: string;
  initialVersion: number;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [version, setVersion] = useState(initialVersion);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await updateTownNameAction(townId, name, version);
    setPending(false);

    if (result.ok) {
      setVersion(result.data.version);
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
      <button className="button" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save name"}
      </button>
    </form>
  );
}
