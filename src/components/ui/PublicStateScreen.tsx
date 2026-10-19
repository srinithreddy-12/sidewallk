import Link from "next/link";
import { Brand } from "./Brand";
import styles from "./PublicStateScreen.module.css";

/**
 * Shared shell for the public town route's not-found/loading states. Deliberately
 * generic enough to cover "no such slug", "this town is a draft" and "a
 * database error happened" with one accessible message — the public route
 * must not reveal which of those actually occurred.
 */
export function PublicStateScreen({
  icon,
  title,
  body,
  headingId = "public-state-title",
}: {
  icon: string;
  title: string;
  body: string;
  headingId?: string;
}) {
  return (
    <main id="main-content" className={styles.page}>
      <header className={styles.nav}>
        <Brand />
      </header>
      <section className={styles.shell} aria-labelledby={headingId}>
        <div className={styles.card}>
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
          <h1 id={headingId}>{title}</h1>
          <p>{body}</p>
          <div className={styles.actions}>
            <Link className="button button--primary" href="/">
              Explore the sample neighborhood
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
