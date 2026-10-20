import { redirect } from "next/navigation";
import { getAuthenticatedViewer } from "@/lib/viewer";
import { Brand } from "@/components/ui/Brand";
import { AcceptInviteButton } from "@/components/workspace/AcceptInviteButton";
import styles from "@/components/ui/PublicStateScreen.module.css";

export default async function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const viewer = await getAuthenticatedViewer();
  if (!viewer) redirect(`/sign-in?next=/invite/${token}`);

  return (
    <main id="main-content" className={styles.page}>
      <header className={styles.nav}>
        <Brand href="/workspace" />
      </header>
      <section className={styles.shell} aria-labelledby="invite-title">
        <div className={styles.card}>
          <span className={styles.icon} aria-hidden="true">
            ✉
          </span>
          <h1 id="invite-title">You&apos;ve been invited to a Sidewallk town.</h1>
          <p>
            Signed in as {viewer.email ?? "your account"}. If this invitation was sent to a different address, sign
            in with that address instead before accepting.
          </p>
          <div className={styles.actions}>
            <AcceptInviteButton token={token} />
          </div>
        </div>
      </section>
    </main>
  );
}
