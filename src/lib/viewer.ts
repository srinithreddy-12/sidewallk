import "server-only";

import { createSupabaseServerClient } from "./supabase/server";

export interface AuthenticatedViewer {
  userId: string;
  email: string | null;
}

export async function getAuthenticatedViewer(): Promise<AuthenticatedViewer | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims || typeof claims.sub !== "string") return null;

  const email = claims.email;
  return { userId: claims.sub, email: typeof email === "string" ? email : null };
}
