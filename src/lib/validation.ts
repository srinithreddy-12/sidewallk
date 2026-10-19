import { isSafeUrl } from "./links";
import { PROP_REGISTRY } from "./prop-registry";
import type { ExteriorKind, InteriorTemplate, MemberCategory, MemberLink, RoomProp, RoomPropKind } from "./types";

/**
 * Field-level validators shared by every place untrusted JSON becomes a
 * domain value: local-storage overrides (storage.ts) and database rows
 * (repository/convert.ts). One set of rules, so the two paths can never
 * silently disagree about what counts as a valid member/building/room.
 */

export const CATEGORIES: MemberCategory[] = ["art", "craft", "design", "food", "music", "writing"];
export const TEMPLATES: InteriorTemplate[] = ["gallery", "studio", "shop"];
export const EXTERIOR_KINDS: ExteriorKind[] = [
  "gallery-front",
  "studio-front",
  "shop-front",
  "cafe-front",
  "press-front",
];
export const PROP_KINDS = Object.keys(PROP_REGISTRY) as RoomPropKind[];

/** For structural identifiers that are never user-clearable — must actually have content. */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * For free text a user can legitimately clear (name, tagline, description,
 * link label, prop title/description). Only the type is checked — an empty
 * string is a valid, intentional value.
 */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(value);
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function isMemberCategory(value: unknown): value is MemberCategory {
  return typeof value === "string" && CATEGORIES.includes(value as MemberCategory);
}

export function isInteriorTemplate(value: unknown): value is InteriorTemplate {
  return typeof value === "string" && TEMPLATES.includes(value as InteriorTemplate);
}

export function isExteriorKind(value: unknown): value is ExteriorKind {
  return typeof value === "string" && EXTERIOR_KINDS.includes(value as ExteriorKind);
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Matches the database's slug check constraint exactly — lowercase, hyphen-separated, no leading/trailing/double hyphens. */
export function isValidSlug(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 100 && SLUG_PATTERN.test(value);
}

/** Best-effort normalization for a user-typed slug field. Does not guarantee the result is valid — check with `isValidSlug`. */
export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Re-validates a link's protocol every time, so a save from before the
 * allowlist tightened (or a row edited directly in the database) can't slip
 * an unsafe URL through. `id` must be non-empty; `label`/`url` are
 * user-editable and an intentionally empty `url` is allowed through as-is —
 * it just won't render as a link. A *non*-empty url must still pass the
 * allowlist.
 */
export function validateLink(value: unknown): MemberLink | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const candidate = value as Record<string, unknown>;
  if (!isNonEmptyString(candidate.id) || !isString(candidate.label) || !isString(candidate.url)) {
    return undefined;
  }
  if (candidate.url !== "" && !isSafeUrl(candidate.url)) return undefined;
  return { id: candidate.id, label: candidate.label, url: candidate.url };
}

export function validateProp(value: unknown): RoomProp | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const candidate = value as Record<string, unknown>;
  if (!isNonEmptyString(candidate.id)) return undefined;
  if (typeof candidate.kind !== "string" || !PROP_KINDS.includes(candidate.kind as RoomPropKind)) return undefined;
  if (!isFiniteNumber(candidate.x) || !isFiniteNumber(candidate.y)) return undefined;
  if (!isHexColor(candidate.tone)) return undefined;

  const prop: RoomProp = {
    id: candidate.id,
    kind: candidate.kind as RoomPropKind,
    x: candidate.x,
    y: candidate.y,
    tone: candidate.tone,
  };

  if (candidate.content !== undefined) {
    if (typeof candidate.content !== "object" || candidate.content === null) return prop;
    const contentCandidate = candidate.content as Record<string, unknown>;
    if (!isString(contentCandidate.title) || !isString(contentCandidate.description)) {
      return prop;
    }
    const link = contentCandidate.link !== undefined ? validateLink(contentCandidate.link) : undefined;
    prop.content = link
      ? { title: contentCandidate.title, description: contentCandidate.description, link }
      : { title: contentCandidate.title, description: contentCandidate.description };
  }

  return prop;
}
