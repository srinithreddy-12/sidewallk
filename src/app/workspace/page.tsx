import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthenticatedViewer } from "@/lib/viewer";
import { listViewerTowns } from "@/lib/repository/workspace";
import { Brand } from "@/components/ui/Brand";
import { CreateTownForm } from "@/components/workspace/CreateTownForm";
import { signOutAction } from "./actions";
import styles from "./page.module.css";

export default async function WorkspacePage() {
  const viewer = await getAuthenticatedViewer();
  if (!viewer) redirect("/sign-in?next=/workspace");

  const towns = await listViewerTowns(viewer);

  return (
    <main id="main-content" className={styles.page}>
      <header className={styles.nav}>
        <Brand href="/workspace" />
        <div className={styles.identity}>
          <span>{viewer.email ?? "Signed in"}</span>
          <form action={signOutAction}>
            <button className={styles.signOut} type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <section className={styles.shell}>
        <div className={styles.column}>
          <h1>Your towns</h1>
          {towns === null ? (
            <p className={styles.error} role="alert">
              Couldn&apos;t load your towns just now. Reload the page to try again.
            </p>
          ) : towns.length === 0 ? (
            <p className={styles.empty}>
              You don&apos;t organize or belong to a town yet. Start one on the right, or ask an organizer to invite
              you.
            </p>
          ) : (
            <ul className={styles.list}>
              {towns.map((town) => (
                <li key={town.id}>
                  <Link href={`/workspace/towns/${town.id}`} className={styles.townCard}>
                    <div>
                      <strong>{town.name}</strong>
                      <span className={styles.role}>{town.role === "organizer" ? "Organizer" : "Member"}</span>
                    </div>
                    <span className={styles.status}>
                      {town.publicationStatus === "published" ? "Published" : "Draft"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={styles.column}>
          <h2>Start a new town</h2>
          <CreateTownForm />
        </div>
      </section>
    </main>
  );
}
