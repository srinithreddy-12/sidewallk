import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthenticatedViewer } from "@/lib/viewer";
import { getWorkspaceTown } from "@/lib/repository/workspace";
import { Brand } from "@/components/ui/Brand";
import { WorkspaceMemberEditor } from "@/components/workspace/WorkspaceMemberEditor";
import styles from "./page.module.css";

export default async function WorkspaceMemberPage({
  params,
}: {
  params: Promise<{ townId: string; memberId: string }>;
}) {
  const { townId, memberId } = await params;
  const viewer = await getAuthenticatedViewer();
  if (!viewer) redirect(`/sign-in?next=/workspace/towns/${townId}/members/${memberId}`);

  const result = await getWorkspaceTown(townId, viewer);
  if (!result.ok) {
    return (
      <main id="main-content" className={styles.page}>
        <header className={styles.nav}>
          <Brand href="/workspace" />
        </header>
        <div className={styles.denied}>
          <p>You don&apos;t have access to this town.</p>
          <Link href="/workspace">← Back to your towns</Link>
        </div>
      </main>
    );
  }

  const { town, role, memberId: ownMemberId } = result.data;

  // UI-level gate only — the real boundary is updateMember's own
  // authorizeTownAction("edit-member", ...) check and Postgres RLS. This
  // just avoids showing a member a dead-end editor for someone else's
  // building.
  if (role === "member" && memberId !== ownMemberId) {
    return (
      <main id="main-content" className={styles.page}>
        <header className={styles.nav}>
          <Brand href="/workspace" />
        </header>
        <div className={styles.denied}>
          <p>You can only edit your own building.</p>
          <Link href={`/workspace/towns/${townId}`}>← Back to the town</Link>
        </div>
      </main>
    );
  }

  const member = town.members.find((m) => m.id === memberId);
  if (!member) {
    return (
      <main id="main-content" className={styles.page}>
        <header className={styles.nav}>
          <Brand href="/workspace" />
        </header>
        <div className={styles.denied}>
          <p>That member doesn&apos;t exist in this town.</p>
          <Link href={`/workspace/towns/${townId}`}>← Back to the town</Link>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className={styles.page}>
      <header className={styles.nav}>
        <Brand href="/workspace" />
        <Link href={`/workspace/towns/${townId}`} className={styles.breadcrumb}>
          ← {town.name}
        </Link>
      </header>
      <div className={styles.shell}>
        <WorkspaceMemberEditor townId={townId} initialMember={member} initialVersion={member.version} />
      </div>
    </main>
  );
}
