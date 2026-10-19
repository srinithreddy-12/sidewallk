import {
  isExteriorKind,
  isFiniteNumber,
  isHexColor,
  isInteriorTemplate,
  isMemberCategory,
  isNonEmptyString,
  validateLink,
  validateProp,
} from "../validation";
import type { Building, Member, MemberLink, Room, RoomProp, Town } from "../types";
import type { MemberRow, TownRow } from "./rows";

const FALLBACK_LINK: MemberLink = { id: "", label: "", url: "" };

/** An action link always renders something — falling back to an empty (inert) link rather than failing the whole member over one bad field. */
export function convertAction(raw: unknown): MemberLink {
  return validateLink(raw) ?? FALLBACK_LINK;
}

/**
 * The exterior kind and position are structural — the facade renderer has no
 * safe default for an unknown kind, so a row with either missing is dropped
 * entirely (see `convertMemberRow`). Colour and sign text get safe fallbacks
 * so one bad field doesn't sink an otherwise-valid building.
 */
export function convertBuilding(raw: unknown, position: number): Building | null {
  if (typeof raw !== "object" || raw === null) return null;
  const candidate = raw as Record<string, unknown>;
  if (!isNonEmptyString(candidate.id) || !isExteriorKind(candidate.exterior)) return null;

  return {
    id: candidate.id,
    exterior: candidate.exterior,
    position,
    bodyColor: isHexColor(candidate.bodyColor) ? candidate.bodyColor : "#b7a888",
    trimColor: isHexColor(candidate.trimColor) ? candidate.trimColor : "#f3e3c8",
    signText: typeof candidate.signText === "string" ? candidate.signText : "",
  };
}

/** Invalid individual props are dropped, never the whole room — matches the local-storage override rule in storage.ts. */
export function convertRoom(raw: unknown): Room | null {
  if (typeof raw !== "object" || raw === null) return null;
  const candidate = raw as Record<string, unknown>;
  if (!isInteriorTemplate(candidate.template)) return null;
  if (!isFiniteNumber(candidate.gridWidth) || !isFiniteNumber(candidate.gridHeight)) return null;
  if (candidate.gridWidth <= 0 || candidate.gridHeight <= 0) return null;

  const props = Array.isArray(candidate.props)
    ? candidate.props.map(validateProp).filter((p): p is RoomProp => p !== undefined)
    : [];

  return {
    template: candidate.template,
    palette: isHexColor(candidate.palette) ? candidate.palette : "#d8cdbb",
    gridWidth: candidate.gridWidth,
    gridHeight: candidate.gridHeight,
    props,
  };
}

/**
 * Converts one database member row into the rendering domain model. Returns
 * null — never throws — when the row's structural fields (id, category,
 * building, room) can't be trusted, so one corrupt row can't crash the whole
 * town; the caller drops nulls and renders everyone else.
 */
export function convertMemberRow(row: MemberRow): Member | null {
  if (!isNonEmptyString(row.id) || !isMemberCategory(row.category)) return null;

  const building = convertBuilding(row.building, row.sort_order);
  if (!building) return null;

  const room = convertRoom(row.room);
  if (!room) return null;

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    tagline: row.tagline,
    description: row.description,
    action: convertAction(row.action),
    building,
    room,
  };
}

/** A member row plus its public slug — the repository's own wrapper, kept out of the shared `Member` type since demo members have no slug. */
export interface PublicMember extends Member {
  slug: string;
}

export function convertPublicMemberRow(row: MemberRow): PublicMember | null {
  const member = convertMemberRow(row);
  if (!member || !isNonEmptyString(row.slug)) return null;
  return { ...member, slug: row.slug };
}

export interface TownWithSlugMembers extends Town {
  members: PublicMember[];
}

export function convertTownRow(row: TownRow, members: PublicMember[]): TownWithSlugMembers {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    publicationStatus: row.publication_status,
    members,
  };
}

/**
 * Serializers for the write path — the inverse of the `convert*` functions
 * above. `position` is intentionally omitted from the building payload: it
 * is derived from the row's own `sort_order` column at read time, never
 * stored inside the jsonb blob.
 */
export function buildingToJson(building: Building): Record<string, unknown> {
  return {
    id: building.id,
    exterior: building.exterior,
    bodyColor: building.bodyColor,
    trimColor: building.trimColor,
    signText: building.signText,
  };
}

export function roomToJson(room: Room): Record<string, unknown> {
  return {
    template: room.template,
    palette: room.palette,
    gridWidth: room.gridWidth,
    gridHeight: room.gridHeight,
    props: room.props,
  };
}

export function actionToJson(action: MemberLink): Record<string, unknown> {
  return { id: action.id, label: action.label, url: action.url };
}
