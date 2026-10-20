"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { publishTownAction, unpublishTownAction } from "@/app/workspace/towns/[townId]/actions";
import styles from "./PublishControl.module.css";

export function PublishControl({
  townId,
  initialPublished,
  initialVersion,
  townSlug,
}: {
  townId: string;
  initialPublished: boolean;
  initialVersion: number;
  townSlug: string;
}) {
  const router = useRouter();
  const [published, setPublished] = useState(initialPublished);
  const [version, setVersion] = useState(initialVersion);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    setPending(true);
    setMessage(null);
    const result = published
      ? await unpublishTownAction(townId, version)
      : await publishTownAction(townId, version);
    setPending(false);

    if (result.ok) {
      setVersion(result.data.version);
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
      <button className="button button--primary" type="button" onClick={handleToggle} disabled={pending}>
        {pending ? "Working…" : published ? "Unpublish" : "Publish town"}
      </button>
    </div>
  );
}
