import type { Member } from "./types";

/** Matches a member by name or category, case-insensitively. Pure, so it is testable without a DOM. */
export function filterMembers(members: Member[], query: string): Member[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return members;
  return members.filter(
    (member) =>
      member.name.toLowerCase().includes(trimmed) || member.category.toLowerCase().includes(trimmed),
  );
}
