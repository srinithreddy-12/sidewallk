import Link from "next/link";
import { Brand } from "@/components/ui/Brand";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { safeAuthNextPath } from "@/lib/auth-redirect";
import { requestMagicLink } from "./actions";
import styles from "./page.module.css";

const messages: Record<string, string> = {
  "invalid-email": "Enter a valid email address.",
  "not-configured": "Private alpha access is not connected in this environment yet.",
  "request-failed": "We could not send the sign-in link. Try again in a moment.",
  "check-email": "Check your email for a secure sign-in link.",
  "callback-failed": "That sign-in link is invalid or expired. Request a new one.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; next?: string }>;
}) {
  const { status, next } = await searchParams;
  const configured = getSupabasePublicConfig() !== null;
  const message = status ? messages[status] : undefined;
  const safeNext = safeAuthNextPath(next ?? null);

  return <main id="main-content" className={styles.page}>
    <header className={styles.nav}><Brand /><Link className={styles.back} href="/">← <span className={styles.backLabel}>Back to the neighborhood</span></Link></header>
    <section className={styles.shell} aria-labelledby="sign-in-title">
      <div className={styles.panel}>
        <p className={styles.eyebrow}>Sidewallk private alpha</p>
        <h1 id="sign-in-title">Your town, behind the scenes.</h1>
        <p className={styles.intro}>Organizers manage the whole town. Members edit only their own building. Visitors keep exploring published streets without signing in.</p>
        {message ? <p className={styles.notice} role="status">{message}</p> : null}
        {configured ? <form className={styles.form} action={requestMagicLink}>
          <input type="hidden" name="next" value={safeNext} />
          <label htmlFor="sign-in-email">Email address</label>
          <input id="sign-in-email" name="email" type="email" autoComplete="email" required />
          <button className="button button--primary" type="submit">Email me a sign-in link</button>
        </form> : <p className={styles.notice}>Private alpha access is not open on this preview yet. The public sample town remains available.</p>}
        <p className={styles.note}>Town access and creation are invitation-controlled during the private alpha.</p>
      </div>
    </section>
  </main>;
}
