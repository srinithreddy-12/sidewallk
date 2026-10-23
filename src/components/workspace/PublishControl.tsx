"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { publishTownAction, unpublishTownAction } from "@/app/workspace/towns/[townId]/actions";
import type { RunTownMutation } from "./TownManagementControls";
import styles from "./PublishControl.module.css";

export function PublishControl({
  townId,
  initialPublished,
  townSlug,
  mutationPending,
  runMutation,
}: {
  townId: string;
  initialPublished: boolean;
  townSlug: string;
  mutationPending: boolean;
  runMutation: RunTownMutation;
}) {
  const router = useRouter();
  const [published, setPublished] = useState(initialPublished);
  const [message, setMessage] = useState<string | null>(null);

  async function handleToggle() {
    setMessage(null);
    const result = await runMutation((version) =>
      published ? unpublishTownAction(townId, version) : publishTownAction(townId, version),
    );
    if (!result) return;

    if (result.ok) {
      setPublished(!published);
      router.refresh();
      return;
    }
    if (result.reason === "conflict") {
      setMessage("This town changed elsewhere. Reload the page to see the latest state.");
      return;
    }
    setMessage(result.reason === "invalid" ? result.message : "Could not update publication state. Try again.");
  }

  return (
    <div className={styles.wrap}>
      <span className={`${styles.status} ${published ? styles.statusPublished : ""}`}>
        {published ? "Published" : "Draft"}
      </span>
      {published ? (
        <p style={{ fontSize: 12, margin: 0, color: "var(--color-ink-soft)" }}>
          Live at <code>/t/{townSlug}</code>
        </p>
      ) : null}
      {message ? (
        <p className={styles.message} role="alert">
          {message}
        </p>
      ) : null}
      <button className="button button--primary" type="button" onClick={handleToggle} disabled={mutationPending}>
        {mutationPending ? "Working…" : published ? "Unpublish" : "Publish town"}
      </button>
    </div>
  );
}
