import styles from "./TownToolbar.module.css";

export type TownView = "map" | "list";

interface TownToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  view: TownView;
  onViewChange: (view: TownView) => void;
}

export function TownToolbar({ query, onQueryChange, view, onViewChange }: TownToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={`field ${styles.search}`}>
        <label className="field__label" htmlFor="member-search">
          Search members
        </label>
        <input
          id="member-search"
          type="search"
          placeholder="Search by name or category…"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>
      <div className={styles.viewToggle} role="group" aria-label="Town view">
        <button type="button" aria-pressed={view === "map"} onClick={() => onViewChange("map")}>
          Map
        </button>
        <button type="button" aria-pressed={view === "list"} onClick={() => onViewChange("list")}>
          List
        </button>
      </div>
    </div>
  );
}
