"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MemberCategory } from "@/lib/types";
import { addMemberAction } from "@/app/workspace/towns/[townId]/actions";
import styles from "./AddMemberForm.module.css";

const CATEGORIES: MemberCategory[] = ["art", "craft", "design", "food", "music", "writing"];

export function AddMemberForm({ townId }: { townId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<MemberCategory>("art");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await addMemberAction(townId, { name, category });
    setPending(false);
    if (!result.ok) {
      setError(result.reason === "invalid" ? result.message : "Could not add that member. Try again.");
      return;
    }
    setName("");
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="new-member-name">Member name</label>
        <input
          id="new-member-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="off"
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="new-member-category">Category</label>
        <select id="new-member-category" value={category} onChange={(e) => setCategory(e.target.value as MemberCategory)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <button className="button button--primary" type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add member"}
      </button>
    </form>
  );
}
