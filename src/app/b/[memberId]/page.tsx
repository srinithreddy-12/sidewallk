"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMember } from "@/lib/store";
import { isSafeUrl } from "@/lib/links";
import { RoomScene } from "@/components/interior/RoomScene";
import styles from "./page.module.css";

export default function BuildingPage() {
  const { memberId } = useParams<{ memberId: string }>();
  const member = useMember(memberId);

  if (!member) {
    return (
      <main id="main-content" className={styles.page}>
        <p className={styles.notFound}>
          We couldn&apos;t find that member. <Link href="/">Back to the street</Link>
        </p>
      </main>
    );
  }

  const actionIsSafe = isSafeUrl(member.action.url);

  return (
    <main id="main-content" className={styles.page}>
      <Link href="/" className={`button ${styles.back}`}>
        ← Back to the street
      </Link>

      <div className={styles.header}>
        <h1>{member.name}</h1>
        <span className="sample-badge">Sample member</span>
      </div>
      <p className={styles.tagline}>{member.tagline}</p>

      <div className={styles.scene}>
        <RoomScene room={member.room} />
      </div>
      <p className={styles.hint}>Tap or select a highlighted object to see more.</p>

      <p className={styles.description}>{member.description}</p>

      <div className={styles.footer}>
        {actionIsSafe ? (
          <a className="button button--primary" href={member.action.url} target="_blank" rel="noopener noreferrer">
            {member.action.label}
          </a>
        ) : null}
        <Link href="/" className="button">
          Back to the street
        </Link>
      </div>
    </main>
  );
}
