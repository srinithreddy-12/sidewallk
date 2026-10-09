import type { Member } from "@/lib/types";
import styles from "./ListView.module.css";

interface ListViewProps {
  members: Member[];
  onEnter: (memberId: string) => void;
}

/**
 * The same members as the map, as a real list — not a fallback. Fully usable
 * by keyboard and screen reader without ever touching the map.
 */
export function ListView({ members, onEnter }: ListViewProps) {
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
            <span className="sample-badge">Sample member</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
