import type { Member } from "@/lib/types";
import styles from "./ListView.module.css";

interface ListViewProps {
  members: Member[];
  onEnter: (memberId: string) => void;
  /** Only the local sample town is sample content — a real organizer's published town must never carry this label. Defaults to the existing demo behaviour. */
  sampleBadge?: boolean;
}

/**
 * The same members as the map, as a real list — not a fallback. Fully usable
 * by keyboard and screen reader without ever touching the map.
 */
export function ListView({ members, onEnter, sampleBadge = true }: ListViewProps) {
  if (members.length === 0) {
    return <p className={styles.empty}>No members match your search.</p>;
  }

  return (
    <ul className={styles.list}>
      {members.map((member) => (
        <li key={member.id}>
          <button type="button" className={styles.card} onClick={() => onEnter(member.id)}>
            <div className={styles.cardHeader}>
              <strong>{member.name}</strong>
              <span className={styles.category}>{member.category}</span>
            </div>
            <p className={styles.tagline}>{member.tagline}</p>
            {sampleBadge ? <span className="sample-badge">Sample member</span> : null}
          </button>
        </li>
      ))}
    </ul>
  );
}
