/**
 * Shapes exactly as they come back from Postgres (see
 * supabase/migrations/202610170001_phase2b_core.sql). Kept separate from the
 * domain model in `lib/types.ts` on purpose — a database row is untrusted
 * input until `convert.ts` validates it, and the two shapes are allowed to
 * drift (e.g. `town_id`/`created_by` have no equivalent on `Town`).
 */

export type TownPublicationStatusRow = "draft" | "published";

export interface TownRow {
  id: string;
  slug: string;
  name: string;
  publication_status: TownPublicationStatusRow;
  created_by: string;
  version: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberRow {
  id: string;
  town_id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  action: unknown;
  building: unknown;
  room: unknown;
  sort_order: number;
  version: number;
  created_at: string;
  updated_at: string;
}

export type TownRoleRow = "organizer" | "member";
export type MembershipStatusRow = "invited" | "active";

export interface TownMembershipRow {
  town_id: string;
  user_id: string;
  role: TownRoleRow;
  status: MembershipStatusRow;
  member_id: string | null;
  invited_at: string;
  accepted_at: string | null;
}
