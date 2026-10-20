-- Phase 5: invitation foundation. A separate table rather than forcing an
-- "invited but no user yet" state into town_memberships, which requires a
-- real auth.users row per the existing user_id not null foreign key.
--
-- Tokens are stored only as a sha256 hash (pgcrypto's digest(), already
-- available from the core migration's `create extension if not exists
-- pgcrypto`). The plaintext token is returned exactly once, by
-- create_town_invitation, to the organizer who created it — nothing reads
-- it back out of the table afterward. Acceptance hashes the caller-supplied
-- token and compares hashes, so even a full table read (which RLS already
-- forbids for anyone but the town's organizers) would not hand out a
-- usable bearer token.

create table public.town_invitations (
  id uuid primary key default gen_random_uuid(),
  town_id uuid not null references public.towns(id) on delete cascade,
  role public.town_role not null,
  member_id uuid,
  invited_email text not null check (
    invited_email = lower(invited_email)
    and invited_email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'
  ),
  token_hash text not null unique,
  created_by uuid not null references auth.users(id) on delete restrict,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  accepted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (member_id, town_id) references public.members(id, town_id) on delete cascade,
  check (
    (role = 'organizer' and member_id is null)
    or (role = 'member' and member_id is not null)
  ),
  check (accepted_at is null or revoked_at is null)
);

create index town_invitations_town_id_idx on public.town_invitations (town_id);

alter table public.town_invitations enable row level security;

-- No grant to anon at all — unlike towns/members, an invitation is never
-- visible to a signed-out visitor, not even indirectly.
revoke all on public.town_invitations from anon, authenticated;
grant select, insert, update, delete on public.town_invitations to authenticated;

create policy town_invitations_manage_as_organizer
on public.town_invitations for all
to authenticated
using (public.is_active_town_organizer(town_id))
with check (public.is_active_town_organizer(town_id));

-- Deliberately no policy letting an invited user SELECT their own
-- invitation row directly — lookup and acceptance both go through
-- accept_town_invitation below, which hashes the supplied token itself and
-- never returns token_hash. "No invitation access before acceptance" holds
-- even for the invitation's own intended recipient.

create function public.create_town_invitation(
  p_town_id uuid,
  p_role public.town_role,
  p_member_id uuid,
  p_invited_email text,
  p_ttl_hours integer default 168
)
returns table (invitation_id uuid, token text, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  normalized_email text := lower(trim(p_invited_email));
  new_token text;
  new_token_hash text;
  new_id uuid;
  new_expires_at timestamptz;
begin
  if actor_id is null then
    raise exception 'authentication required';
  end if;
  if not public.is_active_town_organizer(p_town_id) then
    raise exception 'only an active organizer can invite';
  end if;
  if p_ttl_hours is null or p_ttl_hours <= 0 or p_ttl_hours > 24 * 30 then
    raise exception 'invalid expiry';
  end if;
  if p_role = 'organizer' and p_member_id is not null then
    raise exception 'an organizer invitation cannot carry a member id';
  end if;
  if p_role = 'member' and p_member_id is null then
    raise exception 'a member invitation requires a member id';
  end if;

  new_token := encode(extensions.gen_random_bytes(32), 'hex');
  new_token_hash := encode(extensions.digest(new_token, 'sha256'), 'hex');
  new_expires_at := now() + make_interval(hours => p_ttl_hours);

  insert into public.town_invitations (
    town_id, role, member_id, invited_email, token_hash, created_by, expires_at
  ) values (
    p_town_id, p_role, p_member_id, normalized_email, new_token_hash, actor_id, new_expires_at
  )
  returning id into new_id;

  return query select new_id, new_token, new_expires_at;
end;
$$;

create function public.revoke_town_invitation(p_invitation_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  target_town_id uuid;
begin
  if actor_id is null then
    raise exception 'authentication required';
  end if;

  select town_id into target_town_id from public.town_invitations where id = p_invitation_id;
  if target_town_id is null then
    return false;
  end if;
  if not public.is_active_town_organizer(target_town_id) then
    raise exception 'only an active organizer can revoke an invitation';
  end if;

  update public.town_invitations
  set revoked_at = now()
  where id = p_invitation_id
    and accepted_at is null
    and revoked_at is null;

  return found;
end;
$$;

-- Verifies the signed-in email matches the invitation, enforces single-use
-- and expiry, and grants membership atomically. One generic failure
-- message covers "no such token", expired, revoked, already accepted and
-- email mismatch alike — an invitation link should not let a caller
-- distinguish those cases from one another.
create function public.accept_town_invitation(p_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_email text := lower(coalesce(auth.email(), ''));
  supplied_hash text;
  invitation public.town_invitations;
begin
  if actor_id is null or actor_email = '' then
    raise exception 'authentication required';
  end if;

  supplied_hash := encode(extensions.digest(p_token, 'sha256'), 'hex');

  select * into invitation
  from public.town_invitations
  where token_hash = supplied_hash
    and accepted_at is null
    and revoked_at is null
    and expires_at > now()
    and invited_email = actor_email
  for update;

  if not found then
    raise exception 'this invitation link is invalid, expired or already used';
  end if;

  if invitation.role = 'organizer' then
    insert into public.town_memberships (town_id, user_id, role, status, accepted_at)
    values (invitation.town_id, actor_id, 'organizer', 'active', now())
    on conflict (town_id, user_id) do update
      set role = 'organizer', status = 'active', accepted_at = now(), member_id = null;
  else
    insert into public.town_memberships (town_id, user_id, role, status, member_id, accepted_at)
    values (invitation.town_id, actor_id, 'member', 'active', invitation.member_id, now())
    on conflict (town_id, user_id) do update
      set role = 'member', status = 'active', member_id = invitation.member_id, accepted_at = now();
  end if;

  update public.town_invitations
  set accepted_at = now(), accepted_by = actor_id
  where id = invitation.id;

  return invitation.town_id;
end;
$$;

revoke all on function public.create_town_invitation(uuid, public.town_role, uuid, text, integer) from public;
revoke all on function public.revoke_town_invitation(uuid) from public;
revoke all on function public.accept_town_invitation(text) from public;
revoke all on function public.create_town_invitation(uuid, public.town_role, uuid, text, integer) from anon;
revoke all on function public.revoke_town_invitation(uuid) from anon;
revoke all on function public.accept_town_invitation(text) from anon;
grant execute on function public.create_town_invitation(uuid, public.town_role, uuid, text, integer) to authenticated;
grant execute on function public.revoke_town_invitation(uuid) to authenticated;
grant execute on function public.accept_town_invitation(text) to authenticated;
