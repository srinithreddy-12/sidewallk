import type { PublicationStatus } from "./types";

export type TownRole = "organizer" | "member";

export type TownMembership =
  | {
      townId: string;
      userId: string;
      role: "organizer";
      status: "invited" | "active";
    }
  | {
      townId: string;
      userId: string;
      role: "member";
      status: "invited" | "active";
      memberId: string;
    };

export interface ViewerContext {
  /** Null means a signed-out visitor. */
  userId: string | null;
  membership?: TownMembership;
}

export type TownAction =
  | "view-town"
  | "edit-town"
  | "publish-town"
  | "invite-members"
  | "edit-member"
  | "upload-member-assets";

export type AccessDenialReason =
  | "town-not-published"
  | "sign-in-required"
  | "membership-required"
  | "membership-not-active"
  | "organizer-required"
  | "member-mismatch"
  | "member-required";

export type AccessDecision =
  | { allowed: true }
  | { allowed: false; reason: AccessDenialReason };

export interface AuthorizeTownActionInput {
  action: TownAction;
  townId: string;
  publicationStatus: PublicationStatus;
  viewer: ViewerContext;
  /** Required for actions that target one member building. */
  memberId?: string;
}

function activeMembership(
  townId: string,
  viewer: ViewerContext,
): TownMembership | undefined {
  const membership = viewer.membership;
  if (!membership || membership.townId !== townId || membership.userId !== viewer.userId) {
    return undefined;
  }
  return membership;
}

/**
 * Shared optimistic permission model for UI and server-side DAL checks.
 * Database row-level security remains the final enforcement boundary.
 */
export function authorizeTownAction({
  action,
  townId,
  publicationStatus,
  viewer,
  memberId,
}: AuthorizeTownActionInput): AccessDecision {
  const membership = activeMembership(townId, viewer);

  if (action === "view-town" && publicationStatus === "published") {
    return { allowed: true };
  }

  if (!viewer.userId) {
    return {
      allowed: false,
      reason: action === "view-town" ? "town-not-published" : "sign-in-required",
    };
  }

  if (!membership) {
    return { allowed: false, reason: "membership-required" };
  }

  if (membership.status !== "active") {
    return { allowed: false, reason: "membership-not-active" };
  }

  if (action === "view-town") {
    return { allowed: true };
  }

  if ((action === "edit-member" || action === "upload-member-assets") && !memberId) {
    return { allowed: false, reason: "member-required" };
  }

  if (membership.role === "organizer") {
    return { allowed: true };
  }

  if (action === "edit-member" || action === "upload-member-assets") {
    return membership.memberId === memberId
      ? { allowed: true }
      : { allowed: false, reason: "member-mismatch" };
  }

  return { allowed: false, reason: "organizer-required" };
}
