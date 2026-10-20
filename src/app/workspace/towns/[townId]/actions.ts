"use server";

import { redirect } from "next/navigation";
import { getAuthenticatedViewer } from "@/lib/viewer";
import {
  addMember,
  publishTown,
  unpublishTown,
  updateMember,
  updateTownName,
  type MemberPatch,
  type RepositoryResult,
} from "@/lib/repository/workspace";
import { createInvitation, revokeInvitation, type InvitationResult } from "@/lib/repository/invitations";
import type { TownRole } from "@/lib/access";
import type { MemberCategory } from "@/lib/types";

async function requireViewer(townId: string) {
  const viewer = await getAuthenticatedViewer();
  if (!viewer) redirect(`/sign-in?next=/workspace/towns/${townId}`);
  return viewer;
}

export async function updateTownNameAction(
  townId: string,
  name: string,
  expectedVersion: number,
): Promise<RepositoryResult<{ version: number }>> {
  const viewer = await requireViewer(townId);
  return updateTownName(townId, viewer, name, expectedVersion);
}

export async function addMemberAction(
  townId: string,
  input: { name: string; category: MemberCategory },
): Promise<RepositoryResult<{ memberId: string }>> {
  const viewer = await requireViewer(townId);
  return addMember(townId, viewer, input);
}

export async function updateMemberAction(
  townId: string,
  memberId: string,
  patch: MemberPatch,
  expectedVersion: number,
): Promise<RepositoryResult<{ version: number }>> {
  const viewer = await requireViewer(townId);
  return updateMember(townId, memberId, viewer, patch, expectedVersion);
}

export async function publishTownAction(
  townId: string,
  expectedVersion: number,
): Promise<RepositoryResult<{ version: number; publishedAt: string }>> {
  const viewer = await requireViewer(townId);
  return publishTown(townId, viewer, expectedVersion);
}

export async function unpublishTownAction(
  townId: string,
  expectedVersion: number,
): Promise<RepositoryResult<{ version: number }>> {
  const viewer = await requireViewer(townId);
  return unpublishTown(townId, viewer, expectedVersion);
}

export async function createInvitationAction(
  townId: string,
  input: { role: TownRole; memberId: string | null; email: string },
): Promise<InvitationResult<{ invitationId: string; token: string; expiresAt: string }>> {
  await requireViewer(townId);
  return createInvitation(townId, input);
}

export async function revokeInvitationAction(
  townId: string,
  invitationId: string,
): Promise<InvitationResult<{ revoked: boolean }>> {
  await requireViewer(townId);
  return revokeInvitation(invitationId);
}
