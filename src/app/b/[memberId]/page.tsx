"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMember } from "@/lib/store";
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

  return (
    <main id="main-content" className={styles.page}>
      <Link href="/" className={`button ${styles.back}`}>
        ← Back to the street
      </Link>
      <h1>{member.name}</h1>
      <p>{member.tagline}</p>
      <span className="sample-badge">Sample member</span>
      <p>{member.description}</p>
    </main>
  );
}
