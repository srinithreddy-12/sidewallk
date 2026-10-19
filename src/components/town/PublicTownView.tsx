"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { filterMembers } from "@/lib/search";
import { Brand } from "@/components/ui/Brand";
import { Neighborhood } from "@/components/town/Neighborhood";
import { ListView } from "@/components/town/ListView";
import type { Member, MemberCategory } from "@/lib/types";
import type { PublicMember, TownWithSlugMembers } from "@/lib/repository/convert";
import styles from "../../app/page.module.css";

const categories: { value: MemberCategory | "all"; label: string }[] = [
  { value: "all", label: "All places" },
  { value: "art", label: "Art & galleries" },
  { value: "craft", label: "Makers" },
  { value: "design", label: "Design" },
  { value: "food", label: "Food" },
  { value: "music", label: "Music" },
  { value: "writing", label: "Writing" },
];

/**
 * The published-town equivalent of the sample HomePage — same map/list/
 * search experience, driven by a server-fetched town instead of the local
 * override store, and routing into `/t/[townSlug]/b/[memberSlug]` instead of
 * the sample `/b/[memberId]` route.
 */
export function PublicTownView({ town }: { town: TownWithSlugMembers }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<MemberCategory | "all">("all");
  const [view, setView] = useState<"map" | "list">("map");
  const [selectedId, setSelectedId] = useState(town.members[0]?.id ?? null);

  const members = useMemo(
    () => filterMembers(town.members, query).filter((m) => category === "all" || m.category === category),
    [town.members, query, category],
  );
  const selected = members.find((m) => m.id === selectedId) ?? members[0];

  const slugFor = (memberId: string): string =>
    town.members.find((m: PublicMember) => m.id === memberId)?.slug ?? memberId;
  const enter = (memberId: string) => router.push(`/t/${town.slug}/b/${slugFor(memberId)}`);

  return (
    <main id="main-content" className={styles.page}>
      <header className={styles.nav}>
        <Brand href={`/t/${town.slug}`} />
        <div className={styles.navCenter}>
          <span className={styles.townDot} />
          <span>{town.name}</span>
        </div>
        <div className={styles.navActions}>
          <button
            className={styles.directoryButton}
            onClick={() => setView(view === "map" ? "list" : "map")}
          >
            {view === "map" ? "↗ Directory" : "↗ Map view"}
          </button>
        </div>
      </header>
      <div className={styles.stage}>
        <section className={styles.intro}>
          <p className={styles.eyebrow}>A Sidewallk neighborhood</p>
          <h1>
            Good things <br />
            happen <br />
            <em>next door.</em>
          </h1>
          <p className={styles.subtitle}>Wander into a studio. Find your next favorite artist.</p>
          <div className={styles.search}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="10" cy="10" r="6" />
              <path d="m15 15 5 5" />
            </svg>
            <label className="visually-hidden" htmlFor="member-search">
              Search places
            </label>
            <input
              id="member-search"
              type="search"
              placeholder="Find a place or a maker"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className={styles.categories} role="group" aria-label="Filter places">
            {categories.map((c) => (
              <button key={c.value} aria-pressed={category === c.value} onClick={() => setCategory(c.value)}>
                {c.label}
              </button>
            ))}
          </div>
        </section>
        {view === "map" ? (
          <Neighborhood
            members={members as Member[]}
            allMembers={town.members as Member[]}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedId}
            onEnter={enter}
            sampleLabels={false}
          />
        ) : (
          <section className={styles.directory}>
            <p className={styles.eyebrow}>The neighborhood directory</p>
            <h2>Find your kind of place.</h2>
            <ListView members={members as Member[]} onEnter={enter} sampleBadge={false} />
          </section>
        )}
        {view === "map" && selected ? (
          <aside className={styles.featured}>
            <div className={styles.featuredTop}>
              <span className={styles.featuredIcon}>⌂</span>
              <span>{selected.category}</span>
              <span className={styles.number}>0{selected.building.position + 1}</span>
            </div>
            <h2>{selected.name}</h2>
            <p>{selected.tagline}</p>
            <button onClick={() => enter(selected.id)}>
              Step inside <span>↗</span>
            </button>
          </aside>
        ) : null}
      </div>
    </main>
  );
}
