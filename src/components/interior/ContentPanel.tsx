import { Dialog } from "@/components/ui/Dialog";
import { isSafeUrl } from "@/lib/links";
import type { PropContent } from "@/lib/types";
import styles from "./ContentPanel.module.css";

interface ContentPanelProps {
  content: PropContent;
  onClose: () => void;
}

const TITLE_ID = "content-panel-title";

export function ContentPanel({ content, onClose }: ContentPanelProps) {
  const showLink = content.link && isSafeUrl(content.link.url);

  return (
    <Dialog titleId={TITLE_ID} onClose={onClose}>
      <h2 id={TITLE_ID} className={styles.title}>
        {content.title}
      </h2>
      <p className={styles.description}>{content.description}</p>
      <div className={styles.footer}>
        {showLink && content.link ? (
          <a className="button button--primary" href={content.link.url} target="_blank" rel="noopener noreferrer">
            {content.link.label}
          </a>
        ) : (
          <span />
        )}
        <button type="button" className="button" onClick={onClose}>
          Close
        </button>
      </div>
    </Dialog>
  );
}
