"use server";

import { redirect } from "next/navigation";
import { getAuthenticatedViewer } from "@/lib/viewer";
import { acceptInvitation, type InvitationResult } from "@/lib/repository/invitations";

export async function acceptInvitationAction(token: string): Promise<InvitationResult<{ townId: string }>> {
  const viewer = await getAuthenticatedViewer();
  if (!viewer) redirect(`/sign-in?next=/invite/${token}`);
  return acceptInvitation(token);
}
