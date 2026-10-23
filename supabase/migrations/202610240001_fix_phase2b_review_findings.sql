-- Close the independent-review findings without weakening existing RLS.

-- Private-alpha town creation is limited to manually approved creators or
-- people who already hold an active organizer membership. Authentication can
-- still create a user for a brand-new invitee; that Auth row alone grants no
-- product access and cannot create a town.
create table public.alpha_town_creators (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now(),
  note text not null default ''
);

alter table public.alpha_town_creators enable row level security;
revoke all on public.alpha_town_creators from anon, authenticated;

-- Preserve town creators who may already be using the alpha before this gate
-- is introduced. Future bootstrap access is deliberately granted by an admin
-- insert, never by a browser-facing policy.
insert into public.alpha_town_creators (user_id, note)
select distinct created_by, 'Existing town creator at alpha-gate migration'
from public.towns
on conflict (user_id) do nothing;

create function public.has_alpha_town_creation_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and (
    exists (
      select 1
      from public.alpha_town_creators entitlement
      where entitlement.user_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.town_memberships membership
      where membership.user_id = (select auth.uid())
        and membership.role = 'organizer'
        and membership.status = 'active'
    )
  );
$$;

revoke all on function public.has_alpha_town_creation_access() from public;
revoke all on function public.has_alpha_town_creation_access() from anon;
grant execute on function public.has_alpha_town_creation_access() to authenticated;

create or replace function public.create_town(town_slug text, town_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  new_town_id uuid;
begin
  if actor_id is null then
    raise exception 'authentication required';
  end if;
  if not public.has_alpha_town_creation_access() then
    raise exception 'private alpha town creation access required';
  end if;

  insert into public.towns (slug, name, created_by)
  values (town_slug, town_name, actor_id)
  returning id into new_town_id;

  insert into public.town_memberships (
    town_id,
    user_id,
    role,
    status,
    accepted_at
  ) values (
    new_town_id,
    actor_id,
    'organizer',
    'active',
    now()
  );

  return new_town_id;
end;
$$;

revoke all on function public.create_town(text, text) from public;
revoke all on function public.create_town(text, text) from anon;
grant execute on function public.create_town(text, text) to authenticated;

-- Replace invitation acceptance so a member invitation can never overwrite an
-- existing organizer membership. The generic error deliberately reveals no
-- extra token or membership information.
create or replace function public.accept_town_invitation(p_token text)
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

  if invitation.role = 'member' and exists (
    select 1
    from public.town_memberships membership
    where membership.town_id = invitation.town_id
      and membership.user_id = actor_id
      and membership.role = 'organizer'
  ) then
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

revoke all on function public.accept_town_invitation(text) from public;
revoke all on function public.accept_town_invitation(text) from anon;
grant execute on function public.accept_town_invitation(text) to authenticated;
