import { CATEGORIES, TEMPLATES, isHexColor, isNonEmptyString, isString, validateLink, validateProp } from "./validation";
import type { InteriorTemplate, Member, MemberCategory, MemberOverride, OverrideMap, RoomProp } from "./types";

export const STORAGE_KEY = "sidewallk.town.v1";
const STORAGE_VERSION = 1;

interface StoredShape {
  version: number;
  overrides: OverrideMap;
}

function validateOverride(value: unknown): MemberOverride | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const candidate = value as Record<string, unknown>;
  const result: MemberOverride = {};

  if (candidate.name !== undefined && isString(candidate.name)) {
    result.name = candidate.name;
  }
  if (candidate.category !== undefined && CATEGORIES.includes(candidate.category as MemberCategory)) {
    result.category = candidate.category as MemberCategory;
  }
  if (candidate.tagline !== undefined && isString(candidate.tagline)) {
    result.tagline = candidate.tagline;
  }
  if (candidate.description !== undefined && isString(candidate.description)) {
    result.description = candidate.description;
  }
  if (candidate.action !== undefined) {
    const link = validateLink(candidate.action);
    if (link) result.action = link;
  }
  if (typeof candidate.building === "object" && candidate.building !== null) {
    const buildingCandidate = candidate.building as Record<string, unknown>;
    const building: MemberOverride["building"] = {};
    if (isHexColor(buildingCandidate.bodyColor)) building.bodyColor = buildingCandidate.bodyColor;
    if (isHexColor(buildingCandidate.trimColor)) building.trimColor = buildingCandidate.trimColor;
    if (isNonEmptyString(buildingCandidate.signText)) building.signText = buildingCandidate.signText;
    if (Object.keys(building).length > 0) result.building = building;
  }
  if (typeof candidate.room === "object" && candidate.room !== null) {
    const roomCandidate = candidate.room as Record<string, unknown>;
    const room: MemberOverride["room"] = {};
    if (typeof roomCandidate.template === "string" && TEMPLATES.includes(roomCandidate.template as InteriorTemplate)) {
      room.template = roomCandidate.template as InteriorTemplate;
    }
    if (isHexColor(roomCandidate.palette)) room.palette = roomCandidate.palette;
    if (Array.isArray(roomCandidate.props)) {
      const validProps = roomCandidate.props.map(validateProp).filter((p): p is RoomProp => p !== undefined);
      room.props = validProps;
    }
    if (Object.keys(room).length > 0) result.room = room;
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Parses and validates a raw storage string into an override map. Drops
 * individual bad members or props rather than the whole save; returns an
 * empty map (never throws) for anything unparseable or the wrong version.
 */
export function parseStoredOverrides(raw: string | null): OverrideMap {
  if (!raw) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof parsed !== "object" || parsed === null) return {};
  const shape = parsed as Partial<StoredShape>;
  if (shape.version !== STORAGE_VERSION) return {};
  if (typeof shape.overrides !== "object" || shape.overrides === null) return {};

  const result: OverrideMap = {};
  for (const [memberId, override] of Object.entries(shape.overrides)) {
    const validated = validateOverride(override);
    if (validated) result[memberId] = validated;
  }
  return result;
}

export function serializeOverrides(overrides: OverrideMap): string {
  const shape: StoredShape = { version: STORAGE_VERSION, overrides };
  return JSON.stringify(shape);
}

export type StorageStatus = { ok: true } | { ok: false; reason: string };

/** Reads overrides from localStorage. Any failure (blocked storage, parse error) yields the empty map, never a throw. */
export function loadOverrides(): OverrideMap {
  try {
    return parseStoredOverrides(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return {};
  }
}

/** Writes overrides to localStorage. Private mode, blocked site data and quota errors surface as a status, never a crash. */
export function saveOverrides(overrides: OverrideMap): StorageStatus {
  try {
    window.localStorage.setItem(STORAGE_KEY, serializeOverrides(overrides));
    return { ok: true };
  } catch {
    return { ok: false, reason: "Could not save — your browser may be blocking local storage." };
  }
}

/** Merges an editor patch into an existing override. `room.props`, once touched, fully replaces the prop list. */
export function mergeOverride(
  existing: MemberOverride | undefined,
  patch: MemberOverride,
): MemberOverride {
  const base = existing ?? {};
  return {
    ...base,
    ...patch,
    building:
      patch.building || base.building
        ? { ...base.building, ...patch.building }
        : undefined,
    room:
      patch.room || base.room
        ? {
            template: patch.room?.template ?? base.room?.template,
            palette: patch.room?.palette ?? base.room?.palette,
            props: patch.room?.props ?? base.room?.props,
          }
        : undefined,
  };
}

/** Drops one member's override, e.g. for "Reset to demo data". Returns the same map reference when there was nothing to remove. */
export function removeOverride(overrides: OverrideMap, memberId: string): OverrideMap {
  if (!(memberId in overrides)) return overrides;
  const next = { ...overrides };
  delete next[memberId];
  return next;
}

/** Applies a member's override on top of demo data. Pure, so it is testable without a DOM. */
export function applyOverride(member: Member, override: MemberOverride | undefined): Member {
  if (!override) return member;
  return {
    ...member,
    name: override.name ?? member.name,
    category: override.category ?? member.category,
    tagline: override.tagline ?? member.tagline,
    description: override.description ?? member.description,
    action: override.action ?? member.action,
    building: override.building
      ? { ...member.building, ...override.building }
      : member.building,
    room: {
      template: override.room?.template ?? member.room.template,
      palette: override.room?.palette ?? member.room.palette,
      gridWidth: member.room.gridWidth,
      gridHeight: member.room.gridHeight,
      props: override.room?.props ?? member.room.props,
    },
  };
}
