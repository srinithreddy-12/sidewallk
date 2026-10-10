"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTown } from "@/lib/store";
import { filterMembers } from "@/lib/search";
import { Street } from "@/components/town/Street";
import { ListView } from "@/components/town/ListView";
import { TownToolbar, type TownView } from "@/components/town/TownToolbar";
import styles from "./page.module.css";

export default function HomePage() {
  const { town } = useTown();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<TownView>("map");

  const filtered = useMemo(() => filterMembers(town.members, query), [town.members, query]);
  const highlightedId = filtered.length === 1 ? filtered[0]?.id ?? null : null;

  function enterBuilding(memberId: string) {
    router.push(`/b/${memberId}`);
  }

  return (
    <main id="main-content" className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{town.name}</h1>
        <p className={styles.subtitle}>
          Walk the street, find a member and step inside. Every member and every piece of content here is
          invented sample material for this demo.
        </p>
        <span className={`sample-badge ${styles.demoNotice}`}>Sample town — demo data only</span>
      </header>

      <TownToolbar query={query} onQueryChange={setQuery} view={view} onViewChange={setView} />

      {view === "map" ? (
        <Street members={filtered} totalCount={town.members.length} highlightedId={highlightedId} onEnter={enterBuilding} />
      ) : (
        <ListView members={filtered} onEnter={enterBuilding} />
      )}
    </main>
  );
}
