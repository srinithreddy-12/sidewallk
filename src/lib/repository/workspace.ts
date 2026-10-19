import "server-only";

import { createSupabaseServerClient } from "../supabase/server";
import { authorizeTownAction, type AccessDenialReason, type TownRole, type ViewerContext } from "../access";
import { isValidSlug, normalizeSlug } from "../validation";
import {
  actionToJson,
  buildingToJson,
  convertMemberRow,
  convertPublicMemberRow,
  convertTownRow,
  roomToJson,
  type PublicMember,
  type TownWithSlugMembers,
} from "./convert";
import type { MemberRow, TownMembershipRow, TownRow } from "./rows";
import type { AuthenticatedViewer } from "../viewer";
import type { Building, Member, MemberCategory, MemberLink, Room, ExteriorKind, InteriorTemplate } from "../types";

type SupabaseServerClient = NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;

export type RepositoryFailure =
  | { ok: false; reason: AccessDenialReason }
  | { ok: false; reason: "not-configured" }
  | { ok: false; reason: "not-found" }
  | { ok: false; reason: "conflict"; currentVersion: number }
  | { ok: false; reason: "invalid"; message: string };

export type RepositoryResult<T> = { ok: true; data: T } | RepositoryFailure;

async function loadMembership(
  supabase: SupabaseServerClient,
  townId: string,
  userId: string,
): Promise<TownMembershipRow | null> {
  const { data } = await supabase
    .from("town_memberships")
    .select("*")
    .eq("town_id", townId)
    .eq("user_id", userId)
    .maybeSingle();
  return (data as TownMembershipRow | null) ?? null;
}

/** Never trusts a role/membership the browser could have supplied — always re-derived from the just-queried row keyed by the server-verified user id. */
function toViewerContext(townId: string, userId: string, membership: TownMembershipRow | null): ViewerContext {
  if (!membership) return { userId };
  if (membership.role === "organizer") {
    return { userId, membership: { townId, userId, role: "organizer", status: membership.status } };
  }
  if (membership.member_id) {
    return {
      userId,
      membership: { townId, userId, role: "member", status: membership.status, memberId: membership.member_id },
    };
  }
  return { userId };
}

async function fetchTownRow(supabase: SupabaseServerClient, townId: string): Promise<TownRow | null> {
  const { data, error } = await supabase.from("towns").select("*").eq("id", townId).maybeSingle();
  if (error || !data) return null;
  return data as TownRow;
}

async function currentTownVersion(supabase: SupabaseServerClient, townId: string): Promise<number | null> {
  const { data } = await supabase.from("towns").select("version").eq("id", townId).maybeSingle();
  return (data as { version: number } | null)?.version ?? null;
}

async function currentMemberVersion(supabase: SupabaseServerClient, memberId: string): Promise<number | null> {
  const { data } = await supabase.from("members").select("version").eq("id", memberId).maybeSingle();
  return (data as { version: number } | null)?.version ?? null;
}

export interface WorkspaceTownSummary {
  id: string;
  slug: string;
  name: string;
  publicationStatus: "draft" | "published";
  role: TownRole;
}

/** Towns where the viewer has an *active* membership. An invitation (status "invited") never appears here. */
export async function listViewerTowns(viewer: AuthenticatedViewer): Promise<WorkspaceTownSummary[] | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("town_memberships")
    .select("role, town:towns(id, slug, name, publication_status)")
    .eq("user_id", viewer.userId)
    .eq("status", "active");

  if (error || !data) return null;

  const summaries: WorkspaceTownSummary[] = [];
  for (const row of data as unknown as Array<{
    role: TownRole;
    town: { id: string; slug: string; name: string; publication_status: "draft" | "published" } | null;
  }>) {
    if (!row.town) continue;
    summaries.push({
      id: row.town.id,
      slug: row.town.slug,
      name: row.town.name,
      publicationStatus: row.town.publication_status,
      role: row.role,
    });
  }
  return summaries;
}

export interface WorkspaceTownDetail {
  town: TownWithSlugMembers;
  version: number;
  publishedAt: string | null;
  role: TownRole;
  /** The one member row this viewer may edit when their role is "member"; null for an organizer (who may edit any). */
  memberId: string | null;
}

export async function getWorkspaceTown(
  townId: string,
  viewer: AuthenticatedViewer,
): Promise<RepositoryResult<WorkspaceTownDetail>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, reason: "not-configured" };

  const townRow = await fetchTownRow(supabase, townId);
  if (!townRow) return { ok: false, reason: "not-found" };

  const membership = await loadMembership(supabase, townId, viewer.userId);
  const viewerCtx = toViewerContext(townId, viewer.userId, membership);

  const decision = authorizeTownAction({
    action: "view-town",
    townId,
    publicationStatus: townRow.publication_status,
    viewer: viewerCtx,
  });
  if (!decision.allowed) return { ok: false, reason: decision.reason };
  if (!membership) return { ok: false, reason: "membership-required" };

  const { data: memberRows, error: memberError } = await supabase
    .from("members")
    .select("*")
    .eq("town_id", townId)
    .order("sort_order", { ascending: true });
  if (memberError) return { ok: false, reason: "not-found" };

  const members = ((memberRows ?? []) as MemberRow[])
    .map(convertPublicMemberRow)
    .filter((member): member is PublicMember => member !== null);

  return {
    ok: true,
    data: {
      town: convertTownRow(townRow, members),
      version: townRow.version,
      publishedAt: townRow.published_at,
      role: membership.role,
      memberId: membership.member_id,
    },
  };
}

export async function createDraftTown(input: {
  name: string;
  slug: string;
}): Promise<RepositoryResult<{ townId: string }>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, reason: "not-configured" };

  const name = input.name.trim();
  if (name.length < 1 || name.length > 100) {
    return { ok: false, reason: "invalid", message: "Town name must be between 1 and 100 characters." };
  }
  if (!isValidSlug(input.slug)) {
    return {
      ok: false,
      reason: "invalid",
      message: "Slug must be lowercase letters, numbers and single hyphens (e.g. \"maple-street\").",
    };
  }

  // create_town is SECURITY DEFINER and derives the actor from auth.uid() itself —
  // the server never supplies a created_by/organizer id of its own.
  const { data, error } = await supabase.rpc("create_town", { town_slug: input.slug, town_name: name });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, reason: "invalid", message: "That slug is already taken. Choose another." };
    }
    return { ok: false, reason: "invalid", message: "Could not create the town. Try again." };
  }
  if (!data) return { ok: false, reason: "invalid", message: "Could not create the town. Try again." };

  return { ok: true, data: { townId: data as string } };
}

const CATEGORY_EXTERIOR: Record<MemberCategory, ExteriorKind> = {
  art: "gallery-front",
  craft: "studio-front",
  design: "studio-front",
  food: "cafe-front",
  music: "shop-front",
  writing: "press-front",
};

const CATEGORY_TEMPLATE: Record<MemberCategory, InteriorTemplate> = {
  art: "gallery",
  craft: "studio",
  design: "studio",
  food: "shop",
  music: "shop",
  writing: "gallery",
};

function defaultBuilding(category: MemberCategory, id: string): Building {
  return {
    id,
    exterior: CATEGORY_EXTERIOR[category],
    position: 0,
    bodyColor: "#b7a888",
    trimColor: "#f3e3c8",
    signText: "",
  };
}

function defaultRoom(category: MemberCategory): Room {
  return { template: CATEGORY_TEMPLATE[category], palette: "#d8cdbb", gridWidth: 6, gridHeight: 5, props: [] };
}

export async function addMember(
  townId: string,
  viewer: AuthenticatedViewer,
  input: { name: string; category: MemberCategory },
): Promise<RepositoryResult<{ memberId: string }>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, reason: "not-configured" };

  const townRow = await fetchTownRow(supabase, townId);
  if (!townRow) return { ok: false, reason: "not-found" };

  const membership = await loadMembership(supabase, townId, viewer.userId);
  const viewerCtx = toViewerContext(townId, viewer.userId, membership);
  const decision = authorizeTownAction({
    action: "edit-town",
    townId,
    publicationStatus: townRow.publication_status,
    viewer: viewerCtx,
  });
  if (!decision.allowed) return { ok: false, reason: decision.reason };

  const name = input.name.trim();
  if (name.length < 1 || name.length > 100) {
    return { ok: false, reason: "invalid", message: "Member name must be between 1 and 100 characters." };
  }

  const { data: lastRows } = await supabase
    .from("members")
    .select("sort_order")
    .eq("town_id", townId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextSortOrder = lastRows && lastRows.length > 0 ? (lastRows[0] as { sort_order: number }).sort_order + 1 : 0;

  const slugBase = normalizeSlug(name) || "member";
  let slug = slugBase;
  for (let attempt = 1; attempt <= 20; attempt++) {
    const { data: existing } = await supabase
      .from("members")
      .select("id")
      .eq("town_id", townId)
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${slugBase}-${attempt + 1}`;
  }

  const building = defaultBuilding(input.category, `${slug}-building`);
  const room = defaultRoom(input.category);
  const action: MemberLink = { id: `${slug}-action`, label: "", url: "" };

  const { data: inserted, error: insertError } = await supabase
    .from("members")
    .insert({
      town_id: townId,
      slug,
      name,
      category: input.category,
      tagline: "",
      description: "",
      action: actionToJson(action),
      building: buildingToJson(building),
      room: roomToJson(room),
      sort_order: nextSortOrder,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return { ok: false, reason: "invalid", message: "Could not add the member." };
  }
  return { ok: true, data: { memberId: (inserted as { id: string }).id } };
}

export async function updateTownName(
  townId: string,
  viewer: AuthenticatedViewer,
  name: string,
  expectedVersion: number,
): Promise<RepositoryResult<{ version: number }>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, reason: "not-configured" };

  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 100) {
    return { ok: false, reason: "invalid", message: "Town name must be between 1 and 100 characters." };
  }

  const townRow = await fetchTownRow(supabase, townId);
  if (!townRow) return { ok: false, reason: "not-found" };

  const membership = await loadMembership(supabase, townId, viewer.userId);
  const viewerCtx = toViewerContext(townId, viewer.userId, membership);
  const decision = authorizeTownAction({
    action: "edit-town",
    townId,
    publicationStatus: townRow.publication_status,
    viewer: viewerCtx,
  });
  if (!decision.allowed) return { ok: false, reason: decision.reason };

  const { data: updated, error: updateError } = await supabase
    .from("towns")
    .update({ name: trimmed, version: expectedVersion + 1 })
    .eq("id", townId)
    .eq("version", expectedVersion)
    .select("version")
    .maybeSingle();

  if (updateError) return { ok: false, reason: "invalid", message: "Could not save changes." };
  if (!updated) {
    const current = await currentTownVersion(supabase, townId);
    return { ok: false, reason: "conflict", currentVersion: current ?? expectedVersion };
  }
  return { ok: true, data: { version: (updated as { version: number }).version } };
}

export interface MemberPatch {
  name?: string;
  category?: MemberCategory;
  tagline?: string;
  description?: string;
  action?: MemberLink;
  building?: Building;
  room?: Room;
}

export async function updateMember(
  townId: string,
  memberId: string,
  viewer: AuthenticatedViewer,
  patch: MemberPatch,
  expectedVersion: number,
): Promise<RepositoryResult<{ version: number }>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, reason: "not-configured" };

  const townRow = await fetchTownRow(supabase, townId);
  if (!townRow) return { ok: false, reason: "not-found" };

  const membership = await loadMembership(supabase, townId, viewer.userId);
  const viewerCtx = toViewerContext(townId, viewer.userId, membership);
  const decision = authorizeTownAction({
    action: "edit-member",
    townId,
    publicationStatus: townRow.publication_status,
    viewer: viewerCtx,
    memberId,
  });
  if (!decision.allowed) return { ok: false, reason: decision.reason };

  const update: Record<string, unknown> = { version: expectedVersion + 1 };
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.category !== undefined) update.category = patch.category;
  if (patch.tagline !== undefined) update.tagline = patch.tagline;
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.action !== undefined) update.action = actionToJson(patch.action);
  if (patch.building !== undefined) update.building = buildingToJson(patch.building);
  if (patch.room !== undefined) update.room = roomToJson(patch.room);

  const { data: updated, error: updateError } = await supabase
    .from("members")
    .update(update)
    .eq("id", memberId)
    .eq("town_id", townId)
    .eq("version", expectedVersion)
    .select("version")
    .maybeSingle();

  if (updateError) return { ok: false, reason: "invalid", message: "Could not save changes." };
  if (!updated) {
    const current = await currentMemberVersion(supabase, memberId);
    return { ok: false, reason: "conflict", currentVersion: current ?? expectedVersion };
  }
  return { ok: true, data: { version: (updated as { version: number }).version } };
}

export async function publishTown(
  townId: string,
  viewer: AuthenticatedViewer,
  expectedVersion: number,
): Promise<RepositoryResult<{ version: number; publishedAt: string }>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, reason: "not-configured" };

  const townRow = await fetchTownRow(supabase, townId);
  if (!townRow) return { ok: false, reason: "not-found" };

  const membership = await loadMembership(supabase, townId, viewer.userId);
  const viewerCtx = toViewerContext(townId, viewer.userId, membership);
  const decision = authorizeTownAction({
    action: "publish-town",
    townId,
    publicationStatus: townRow.publication_status,
    viewer: viewerCtx,
  });
  if (!decision.allowed) return { ok: false, reason: decision.reason };

  if (!isValidSlug(townRow.slug) || townRow.name.trim().length < 1) {
    return { ok: false, reason: "invalid", message: "Fix the town name and slug before publishing." };
  }

  const { data: memberRows, error: memberError } = await supabase.from("members").select("*").eq("town_id", townId);
  if (memberError) {
    return { ok: false, reason: "invalid", message: "Could not load members to validate publishing." };
  }
  const rows = (memberRows ?? []) as MemberRow[];
  if (rows.length === 0) {
    return { ok: false, reason: "invalid", message: "Add at least one member before publishing." };
  }
  // convertMemberRow drops a row entirely when its building/room is structurally invalid,
  // so a count mismatch here means at least one member can't be safely rendered.
  const validMembers = rows.map(convertMemberRow).filter((member): member is Member => member !== null);
  if (validMembers.length !== rows.length) {
    return {
      ok: false,
      reason: "invalid",
      message: "One or more members have invalid building or room data. Fix them before publishing.",
    };
  }

  const publishedAt = new Date().toISOString();
  const { data: updated, error: updateError } = await supabase
    .from("towns")
    .update({ publication_status: "published", published_at: publishedAt, version: expectedVersion + 1 })
    .eq("id", townId)
    .eq("version", expectedVersion)
    .select("version, published_at")
    .maybeSingle();

  if (updateError) return { ok: false, reason: "invalid", message: "Could not publish." };
  if (!updated) {
    const current = await currentTownVersion(supabase, townId);
    return { ok: false, reason: "conflict", currentVersion: current ?? expectedVersion };
  }
  const row = updated as { version: number; published_at: string };
  return { ok: true, data: { version: row.version, publishedAt: row.published_at } };
}

export async function unpublishTown(
  townId: string,
  viewer: AuthenticatedViewer,
  expectedVersion: number,
): Promise<RepositoryResult<{ version: number }>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, reason: "not-configured" };

  const townRow = await fetchTownRow(supabase, townId);
  if (!townRow) return { ok: false, reason: "not-found" };

  const membership = await loadMembership(supabase, townId, viewer.userId);
  const viewerCtx = toViewerContext(townId, viewer.userId, membership);
  const decision = authorizeTownAction({
    action: "publish-town",
    townId,
    publicationStatus: townRow.publication_status,
    viewer: viewerCtx,
  });
  if (!decision.allowed) return { ok: false, reason: decision.reason };

  const { data: updated, error: updateError } = await supabase
    .from("towns")
    .update({ publication_status: "draft", published_at: null, version: expectedVersion + 1 })
    .eq("id", townId)
    .eq("version", expectedVersion)
    .select("version")
    .maybeSingle();

  if (updateError) return { ok: false, reason: "invalid", message: "Could not unpublish." };
  if (!updated) {
    const current = await currentTownVersion(supabase, townId);
    return { ok: false, reason: "conflict", currentVersion: current ?? expectedVersion };
  }
  return { ok: true, data: { version: (updated as { version: number }).version } };
}
