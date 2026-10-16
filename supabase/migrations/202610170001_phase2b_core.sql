create extension if not exists pgcrypto;

create type public.town_publication_status as enum ('draft', 'published');
create type public.town_role as enum ('organizer', 'member');
create type public.membership_status as enum ('invited', 'active');

create table public.towns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) between 1 and 100),
  publication_status public.town_publication_status not null default 'draft',
  created_by uuid not null references auth.users(id) on delete restrict,
  version integer not null default 1 check (version > 0),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (publication_status = 'draft' and published_at is null)
    or (publication_status = 'published' and published_at is not null)
  )
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  town_id uuid not null references public.towns(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) between 1 and 100),
  category text not null check (category in ('art', 'craft', 'design', 'food', 'music', 'writing')),
  tagline text not null default '',
  description text not null default '',
  action jsonb not null default '{"id":"","label":"","url":""}'::jsonb,
  building jsonb not null,
  room jsonb not null,
  sort_order integer not null check (sort_order >= 0),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (town_id, slug),
  unique (id, town_id),
  check (jsonb_typeof(action) = 'object'),
  check (jsonb_typeof(building) = 'object'),
  check (jsonb_typeof(room) = 'object')
);

create table public.town_memberships (
  town_id uuid not null references public.towns(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.town_role not null,
  status public.membership_status not null default 'invited',
  member_id uuid,
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  primary key (town_id, user_id),
  foreign key (member_id, town_id) references public.members(id, town_id) on delete cascade,
  check (
    (role = 'organizer' and member_id is null)
    or (role = 'member' and member_id is not null)
  ),
  check (
    (status = 'invited' and accepted_at is null)
    or (status = 'active' and accepted_at is not null)
  )
);

-- SECURITY DEFINER helpers avoid recursive RLS when a membership policy needs
-- to inspect the memberships table itself. Their fixed empty search_path keeps
-- untrusted schemas out of name resolution.
create function public.has_active_town_membership(target_town_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.town_memberships membership
    where membership.town_id = target_town_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
  );
$$;

create function public.is_active_town_organizer(target_town_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.town_memberships membership
    where membership.town_id = target_town_id
      and membership.user_id = (select auth.uid())
      and membership.role = 'organizer'
      and membership.status = 'active'
  );
$$;

create function public.can_edit_member(target_town_id uuid, target_member_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.town_memberships membership
    where membership.town_id = target_town_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and (
        membership.role = 'organizer'
        or (membership.role = 'member' and membership.member_id = target_member_id)
      )
  );
$$;

create function public.is_town_creator(target_town_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.towns town
    where town.id = target_town_id
      and town.created_by = (select auth.uid())
  );
$$;

-- Creates the draft and its first active organizer in one transaction, so a
-- new town is never left inaccessible between two client requests.
create function public.create_town(town_slug text, town_name text)
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

revoke all on function public.has_active_town_membership(uuid) from public;
revoke all on function public.is_active_town_organizer(uuid) from public;
revoke all on function public.can_edit_member(uuid, uuid) from public;
revoke all on function public.is_town_creator(uuid) from public;
revoke all on function public.create_town(text, text) from public;
grant execute on function public.has_active_town_membership(uuid) to anon, authenticated;
grant execute on function public.is_active_town_organizer(uuid) to authenticated;
grant execute on function public.can_edit_member(uuid, uuid) to authenticated;
grant execute on function public.is_town_creator(uuid) to authenticated;
grant execute on function public.create_town(text, text) to authenticated;

alter table public.towns enable row level security;
alter table public.members enable row level security;
alter table public.town_memberships enable row level security;

revoke all on public.towns, public.members, public.town_memberships from anon, authenticated;
grant select on public.towns, public.members to anon, authenticated;
grant insert, update, delete on public.towns, public.members, public.town_memberships to authenticated;
grant select on public.town_memberships to authenticated;

create policy towns_read_published_or_joined
on public.towns for select
to anon, authenticated
using (publication_status = 'published' or public.has_active_town_membership(id));

create policy towns_create
on public.towns for insert
to authenticated
with check (created_by = (select auth.uid()));

create policy towns_manage_as_organizer
on public.towns for update
to authenticated
using (public.is_active_town_organizer(id))
with check (public.is_active_town_organizer(id));

create policy towns_delete_as_organizer
on public.towns for delete
to authenticated
using (public.is_active_town_organizer(id));

create policy members_read_published_or_joined
on public.members for select
to anon, authenticated
using (
  public.has_active_town_membership(town_id)
  or exists (
    select 1 from public.towns town
    where town.id = members.town_id
      and town.publication_status = 'published'
  )
);

create policy members_create_as_organizer
on public.members for insert
to authenticated
with check (public.is_active_town_organizer(town_id));

create policy members_update_as_owner_or_organizer
on public.members for update
to authenticated
using (public.can_edit_member(town_id, id))
with check (public.can_edit_member(town_id, id));

create policy members_delete_as_organizer
on public.members for delete
to authenticated
using (public.is_active_town_organizer(town_id));

create policy memberships_read_self_or_as_organizer
on public.town_memberships for select
to authenticated
using (user_id = (select auth.uid()) or public.is_active_town_organizer(town_id));

create policy memberships_bootstrap_organizer
on public.town_memberships for insert
to authenticated
with check (
  role = 'organizer'
  and status = 'active'
  and user_id = (select auth.uid())
  and public.is_town_creator(town_id)
);

create policy memberships_create_as_organizer
on public.town_memberships for insert
to authenticated
with check (public.is_active_town_organizer(town_id));

create policy memberships_update_as_organizer
on public.town_memberships for update
to authenticated
using (public.is_active_town_organizer(town_id))
with check (public.is_active_town_organizer(town_id));

create policy memberships_delete_as_organizer
on public.town_memberships for delete
to authenticated
using (public.is_active_town_organizer(town_id));
