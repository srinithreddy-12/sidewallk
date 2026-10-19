"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthenticatedViewer } from "@/lib/viewer";
import { createDraftTown } from "@/lib/repository/workspace";
import { normalizeSlug } from "@/lib/validation";

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}

export interface CreateTownFormState {
  error?: string;
  values: { name: string; slug: string };
}

/**
 * The creator becomes the first active organizer atomically inside the
 * `create_town` database function, which derives the actor from the
 * server-verified session (`auth.uid()`) itself — nothing here supplies a
 * created_by or organizer id of its own.
 */
export async function createTownAction(
  _previous: CreateTownFormState,
  formData: FormData,
): Promise<CreateTownFormState> {
  const nameValue = formData.get("name");
  const slugValue = formData.get("slug");
  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  const rawSlug = typeof slugValue === "string" ? slugValue.trim() : "";
  const slug = normalizeSlug(rawSlug || name);

  const viewer = await getAuthenticatedViewer();
  if (!viewer) redirect("/sign-in?next=/workspace");

  const result = await createDraftTown({ name, slug });
  if (!result.ok) {
    const message = result.reason === "invalid" ? result.message : "Could not create the town. Try again.";
    return { error: message, values: { name, slug: rawSlug } };
  }

  redirect(`/workspace/towns/${result.data.townId}`);
}
