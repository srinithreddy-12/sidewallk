"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/supabase/config";

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function requestMagicLink(formData: FormData): Promise<never> {
  const emailValue = formData.get("email");
  const email = typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";
  if (!isEmail(email)) redirect("/sign-in?status=invalid-email");

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/sign-in?status=not-configured");

  const callbackUrl = new URL("/auth/callback", getSiteUrl());
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: callbackUrl.toString() },
  });

  redirect(error ? "/sign-in?status=request-failed" : "/sign-in?status=check-email");
}
