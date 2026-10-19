import styles from "./page.module.css";

export default function WorkspaceLoading() {
  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.column}>
          <p className={styles.empty}>Loading your towns…</p>
        </div>
      </div>
    </main>
  );
}
