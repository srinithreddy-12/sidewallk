import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedTownBySlug, findPublicMemberBySlug } from "@/lib/repository/public";
import { isSafeUrl } from "@/lib/links";
import { RoomScene } from "@/components/interior/RoomScene";
import { Brand } from "@/components/ui/Brand";
import styles from "../../../../b/[memberId]/page.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ townSlug: string; memberSlug: string }>;
}): Promise<Metadata> {
  const { townSlug, memberSlug } = await params;
  const town = await getPublishedTownBySlug(townSlug);
  const member = town ? findPublicMemberBySlug(town, memberSlug) : null;
  if (!town || !member) return { title: "Not found — Sidewallk" };
  return { title: `${member.name} — ${town.name}`, description: member.tagline || member.description };
}

export default async function PublicMemberPage({
  params,
}: {
  params: Promise<{ townSlug: string; memberSlug: string }>;
}) {
  const { townSlug, memberSlug } = await params;
  const town = await getPublishedTownBySlug(townSlug);
  const member = town ? findPublicMemberBySlug(town, memberSlug) : null;
  if (!town || !member) notFound();

  const townHref = `/t/${townSlug}`;

  return (
    <main id="main-content" className={styles.page}>
      <header className={styles.nav}>
        <Brand href={townHref} />
        <Link href={townHref} className={styles.breadcrumb}>
          {town.name} <span>/</span> {member.name}
        </Link>
      </header>
      <div className={styles.layout}>
        <aside className={styles.info}>
          <Link href={townHref} className={styles.back}>
            ← Back to the neighborhood
          </Link>
          <p className={styles.eyebrow}>{member.category}</p>
          <h1>{member.name || "Untitled place"}</h1>
          <p className={styles.tagline}>{member.tagline}</p>
          <div className={styles.rule} />
          <p className={styles.description}>{member.description}</p>
          {isSafeUrl(member.action.url) ? (
            <a
              className={`button button--primary ${styles.action}`}
              href={member.action.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {member.action.label || "Visit website"}
              <span>↗</span>
            </a>
          ) : null}
          <div className={styles.visitNote}>
            <span>⌘</span>
            <p>
              Take a closer look.
              <br />
              <strong>Select a framed work or display to explore it.</strong>
            </p>
          </div>
        </aside>
        <section className={styles.room} aria-label="Explore the interior">
          <div className={styles.roomHeading}>
            <span>{member.room.template} interior</span>
          </div>
          <RoomScene room={member.room} memberId={member.id} />
        </section>
      </div>
    </main>
  );
}
