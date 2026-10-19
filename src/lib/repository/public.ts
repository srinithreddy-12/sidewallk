import "server-only";

import { createSupabaseServerClient } from "../supabase/server";
import { convertPublicMemberRow, convertTownRow, type PublicMember, type TownWithSlugMembers } from "./convert";
import type { MemberRow, TownRow } from "./rows";

/**
 * Unauthenticated-safe reads for the public `/t/[townSlug]` route. Returns
 * null for every "don't show this" case — not configured, not found, not
 * published, a database error — so the route can render one accessible
 * not-found state without leaking which case it was. Signed-out visitors
 * reach this through the anon role; row-level security (`towns_read_...`,
 * `members_read_...`) is the real boundary, this function does not add its
 * own bypassable check on top of it.
 */
export async function getPublishedTownBySlug(slug: string): Promise<TownWithSlugMembers | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: townRow, error: townError } = await supabase
    .from("towns")
    .select("*")
    .eq("slug", slug)
    .eq("publication_status", "published")
    .maybeSingle();

  if (townError || !townRow) return null;

  const { data: memberRows, error: memberError } = await supabase
    .from("members")
    .select("*")
    .eq("town_id", (townRow as TownRow).id)
    .order("sort_order", { ascending: true });

  if (memberError) return null;

  const members = ((memberRows ?? []) as MemberRow[])
    .map(convertPublicMemberRow)
    .filter((member): member is PublicMember => member !== null);

  return convertTownRow(townRow as TownRow, members);
}

export function findPublicMemberBySlug(town: TownWithSlugMembers, memberSlug: string): PublicMember | null {
  return town.members.find((member) => member.slug === memberSlug) ?? null;
}
