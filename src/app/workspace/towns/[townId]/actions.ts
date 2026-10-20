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
