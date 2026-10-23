"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/supabase/config";
import { safeAuthNextPath } from "@/lib/auth-redirect";

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function requestMagicLink(formData: FormData): Promise<never> {
  const emailValue = formData.get("email");
  const email = typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";
  const nextValue = formData.get("next");
  const next = safeAuthNextPath(typeof nextValue === "string" ? nextValue : null);
  const nextParam = next === "/" ? "" : `&next=${encodeURIComponent(next)}`;

  if (!isEmail(email)) redirect(`/sign-in?status=invalid-email${nextParam}`);

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect(`/sign-in?status=not-configured${nextParam}`);

  const callbackUrl = new URL("/auth/callback", getSiteUrl());
  if (next !== "/") callbackUrl.searchParams.set("next", next);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    // A town invitation may target someone who does not have an Auth row yet.
    // Database memberships and the alpha town-creator entitlement remain the
    // product access boundary after authentication.
    options: { emailRedirectTo: callbackUrl.toString(), shouldCreateUser: true },
  });

  redirect(error ? `/sign-in?status=request-failed${nextParam}` : `/sign-in?status=check-email${nextParam}`);
}
