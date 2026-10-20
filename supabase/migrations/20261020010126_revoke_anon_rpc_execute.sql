-- The original Phase 2B migration (202610170001_phase2b_core.sql) revoked
-- EXECUTE from the PUBLIC pseudo-role on these five SECURITY DEFINER
-- functions, then granted it back selectively — has_active_town_membership
-- to anon and authenticated (it needs to run for signed-out visitors, since
-- it's used inside the published-or-joined town/member read policies), the
-- other four to authenticated only.
--
-- That revoke targeted the PUBLIC pseudo-role, but this project's schema
-- already carries a default-privilege grant of EXECUTE on new functions to
-- anon/authenticated/service_role (`alter default privileges ... grant
-- execute on functions to anon, authenticated, service_role`), applied the
-- moment each function was created — before the migration's own revoke/
-- grant statements ran. "Revoke from public" never touches a privilege
-- that was granted directly to the anon role, so anon kept its default
-- EXECUTE on create_town, is_active_town_organizer, can_edit_member and
-- is_town_creator despite the migration's intent. Confirmed live via
-- pg_proc.proacl before this fix: all four carried an explicit anon=X
-- entry.
--
-- None of the four are exploitable as written — each one keys off
-- `auth.uid()`, which is null for an anon caller, so create_town raises
-- "authentication required" and the three boolean checks simply return
-- false — but an anonymous, unauthenticated caller should not be able to
-- invoke them at all. Least-privilege, not defense against an active
-- exploit: tighten the grant to match the migration's own stated intent.

revoke execute on function public.is_active_town_organizer(uuid) from anon;
revoke execute on function public.can_edit_member(uuid, uuid) from anon;
revoke execute on function public.is_town_creator(uuid) from anon;
revoke execute on function public.create_town(text, text) from anon;

-- has_active_town_membership is intentionally left untouched: anon keeps
-- EXECUTE there, matching its own migration's explicit
-- `grant execute on function public.has_active_town_membership(uuid) to anon, authenticated;`
