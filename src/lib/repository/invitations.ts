import "server-only";

import { createSupabaseServerClient } from "../supabase/server";
import type { TownRole } from "../access";

export type InvitationResult<T> = { ok: true; data: T } | { ok: false; reason: string };

export interface InvitationSummary {
  id: string;
  role: TownRole;
  memberId: string | null;
  invitedEmail: string;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
}

/**
 * Thin wrappers around the invitation RPCs added in
 * 20261020010413_add_town_invitations.sql. Authorization lives in the
 * database (the RPCs re-check organizer status themselves via
 * is_active_town_organizer, and RLS gates the plain SELECT below) — this
 * layer only shapes results, it adds no access decision of its own.
 */
export async function createInvitation(
  townId: string,
  input: { role: TownRole; memberId: string | null; email: string },
): Promise<InvitationResult<{ invitationId: string; token: string; expiresAt: string }>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, reason: "Private alpha access is not connected in this environment yet." };

  const { data, error } = await supabase.rpc("create_town_invitation", {
    p_town_id: townId,
    p_role: input.role,
    p_member_id: input.memberId,
    p_invited_email: input.email,
  });

  if (error) return { ok: false, reason: error.message };
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) return { ok: false, reason: "Could not create the invitation." };

  return { ok: true, data: { invitationId: row.invitation_id, token: row.token, expiresAt: row.expires_at } };
}

/**
 * Always returns the same generic reason on failure, regardless of why —
 * an invalid token, an email mismatch, an expired, revoked or already-used
 * invitation all look identical from here, matching the database
 * function's own refusal to distinguish them.
 */
export async function acceptInvitation(token: string): Promise<InvitationResult<{ townId: string }>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, reason: "Private alpha access is not connected in this environment yet." };

  const { data, error } = await supabase.rpc("accept_town_invitation", { p_token: token });
  if (error || !data) {
    return { ok: false, reason: "This invitation link is invalid, expired or already used." };
  }
  return { ok: true, data: { townId: data as string } };
}

export async function revokeInvitation(invitationId: string): Promise<InvitationResult<{ revoked: boolean }>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, reason: "Private alpha access is not connected in this environment yet." };

  const { data, error } = await supabase.rpc("revoke_town_invitation", { p_invitation_id: invitationId });
  if (error) return { ok: false, reason: error.message };
  return { ok: true, data: { revoked: Boolean(data) } };
}

/** Empty array both when there genuinely are none and when RLS hides them from a non-organizer — the caller already knows which case it is from its own role check. */
export async function listInvitations(townId: string): Promise<InvitationSummary[] | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("town_invitations")
    .select("id, role, member_id, invited_email, expires_at, accepted_at, revoked_at")
    .eq("town_id", townId)
    .order("created_at", { ascending: false });

  if (error) return null;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    role: row.role as TownRole,
    memberId: row.member_id as string | null,
    invitedEmail: row.invited_email as string,
    expiresAt: row.expires_at as string,
    acceptedAt: row.accepted_at as string | null,
    revokedAt: row.revoked_at as string | null,
  }));
}
