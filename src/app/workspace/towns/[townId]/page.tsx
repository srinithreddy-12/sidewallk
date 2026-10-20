import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthenticatedViewer } from "@/lib/viewer";
import { getWorkspaceTown } from "@/lib/repository/workspace";
import { Brand } from "@/components/ui/Brand";
import { TownSettingsForm } from "@/components/workspace/TownSettingsForm";
import { PublishControl } from "@/components/workspace/PublishControl";
import { AddMemberForm } from "@/components/workspace/AddMemberForm";
import styles from "./page.module.css";

const FAILURE_MESSAGES: Record<string, string> = {
  "not-found": "That town doesn't exist, or you don't have access to it.",
  "sign-in-required": "Sign in to view this town.",
  "membership-required": "You don't have access to this town.",
  "membership-not-active": "Your invitation to this town hasn't been accepted yet.",
  "town-not-published": "That town isn't published yet.",
  "organizer-required": "Only an organizer can do that.",
  "member-mismatch": "You can only edit your own building.",
  "member-required": "That action needs a specific member.",
  "not-configured": "Private alpha access is not connected in this environment yet.",
};

export default async function WorkspaceTownPage({ params }: { params: Promise<{ townId: string }> }) {
  const { townId } = await params;
  const viewer = await getAuthenticatedViewer();
  if (!viewer) redirect(`/sign-in?next=/workspace/towns/${townId}`);

  const result = await getWorkspaceTown(townId, viewer);

  if (!result.ok) {
    return (
      <main id="main-content" className={styles.page}>
        <header className={styles.nav}>
          <Brand href="/workspace" />
        </header>
        <section className={styles.shell}>
          <div className={styles.section}>
            <h2>Can&apos;t open this town</h2>
            <p className={styles.empty}>{FAILURE_MESSAGES[result.reason] ?? "Something went wrong."}</p>
            <Link href="/workspace">← Back to your towns</Link>
          </div>
        </section>
      </main>
    );
  }

  const { town, version, role, memberId } = result.data;
  const isOrganizer = role === "organizer";
  const ownMember = memberId ? town.members.find((m) => m.id === memberId) : null;

  return (
    <main id="main-content" className={styles.page}>
      <header className={styles.nav}>
        <Brand href="/workspace" />
        <Link href="/workspace" className={styles.breadcrumb}>
          Workspace <span>/</span> {town.name}
        </Link>
        <div className={styles.navActions}>
          <Link href={`/workspace/towns/${townId}/preview`}>Preview draft ↗</Link>
        </div>
      </header>
      <section className={styles.shell}>
        {isOrganizer ? (
          <>
            <div className={styles.section}>
              <h2>Town settings</h2>
              <TownSettingsForm townId={townId} initialName={town.name} initialVersion={version} />
              <div style={{ marginTop: 20 }}>
                <PublishControl
                  townId={townId}
                  townSlug={town.slug}
                  initialPublished={town.publicationStatus === "published"}
                  initialVersion={version}
                />
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Members</h2>
              </div>
              {town.members.length === 0 ? (
                <p className={styles.empty}>No members yet. Add the first one below.</p>
              ) : (
                <ul className={styles.list}>
                  {town.members.map((member) => (
                    <li key={member.id} className={styles.memberRow}>
                      <div>
                        <strong>{member.name || "Untitled member"}</strong>
                        <span className={styles.memberCategory}>{member.category}</span>
                      </div>
                      <div className={styles.memberActions}>
                        <Link href={`/workspace/towns/${townId}/members/${member.id}`}>Edit</Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div style={{ marginTop: 20 }}>
                <AddMemberForm townId={townId} />
              </div>
            </div>
          </>
        ) : (
          <div className={styles.section}>
            <h2>Your building</h2>
            {ownMember ? (
              <ul className={styles.list}>
                <li className={styles.memberRow}>
                  <div>
                    <strong>{ownMember.name || "Untitled member"}</strong>
                    <span className={styles.memberCategory}>{ownMember.category}</span>
                  </div>
                  <div className={styles.memberActions}>
                    <Link href={`/workspace/towns/${townId}/members/${ownMember.id}`}>Edit</Link>
                  </div>
                </li>
              </ul>
            ) : (
              <p className={styles.empty}>No building is assigned to you yet.</p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
